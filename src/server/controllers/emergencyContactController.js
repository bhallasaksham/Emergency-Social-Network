import {RESPONSE_TYPE, STATUS_CODE} from '/server/util/enum';
import {EmergencyContact, User, Chatroom} from '/server/models/schema';
import chatroomModel from '/server/models/chatroomModel';
import emergencyContactModel from '/server/models/emergencyContactModel';
import userModel from '/server/models/userModel';
import jwt from '/server/util/jwtSign';
import {
  Notifier,
  PublicWallDecorator,
  EmailDecorator,
  sendgridClient,
} from './notifier';

let emergencyContactCollection = EmergencyContact;
let userCollection = User;
let chatroomCollection = Chatroom;

let emailClient = sendgridClient;

const setEmailClient = (client) => {
  emailClient = client;
};

const createChatroomIfNotExist = async (citizen_id, contact_user_id) => {
  // create a chatroom if doesn't exist
  const params = {
    members: [citizen_id, contact_user_id],
  };

  const chatroom = await chatroomModel.getChatroomByMembers(
    chatroomCollection,
    params,
  );

  if (!chatroom) {
    await chatroomModel.createChatroom(chatroomCollection, params);
  }
};

const saveEmergencyContact = async (req, res) => {
  try {
    const {contact_username, email_address, enable_send_public_message} =
      req.body;

    const token = jwt.getToken(req);
    const user = await jwt.getUserFromToken(token);

    const validationResult = await isValidContact(
      user.username,
      contact_username,
    );
    if (!validationResult['isValid']) {
      return res.status(validationResult['returnCode']).send({
        type: RESPONSE_TYPE.EMERGENCY_CONTACT,
        data: {},
        message: validationResult['message'],
      });
    }

    const query = {
      citizen_id: user._id,
      contact_user_id: validationResult.contactUser._id,
      email_address: email_address,
      enable_send_public_message: enable_send_public_message,
    };

    let contact = await emergencyContactModel.createEmergencyContact(
      emergencyContactCollection,
      query,
    );

    // convert Mongo obj to JS obj to add key username
    contact = contact.toObject();
    contact.username = validationResult.contactUser.username;

    await createChatroomIfNotExist(user._id, validationResult.contactUser._id);

    res.status(201).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {contact},
      message: 'create emergency contact successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    // MongoServerError: E11000 duplicate key error collection
    if (err.code == 11000) {
      return res.status(409).send({
        type: RESPONSE_TYPE.EMERGENCY_CONTACT,
        data: {},
        message: 'emergency contact already exist',
      });
    }

    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getEmergencyContact = async (req, res) => {
  try {
    const token = jwt.getToken(req);
    const user = await jwt.getUserFromToken(token);

    const filter = {
      userId: user._id,
    };

    let contact = await emergencyContactModel.getEmergencyContact(
      EmergencyContact,
      filter,
    );

    if (!contact) {
      return res.status(404).send({
        type: RESPONSE_TYPE.EMERGENCY_CONTACT,
        data: {},
        message: 'emergency contact not found',
      });
    }

    const contactUser = await userModel.getUser(userCollection, {
      _id: contact.contact_user_id,
    });

    // convert Mongo obj to JS obj to add key username
    contact = contact.toObject();
    contact['username'] = contactUser.username;

    res.status(200).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {contact},
      message: 'get emergency contact successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {},
      message: 'internal server error',
    });
  }
};

const updateEmergencyContact = async (req, res) => {
  try {
    const {contact_username, email_address, enable_send_public_message} =
      req.body;

    const token = jwt.getToken(req);
    const user = await jwt.getUserFromToken(token);

    const validationResult = await isValidContact(
      user.username,
      contact_username,
    );
    if (!validationResult['isValid']) {
      return res.status(validationResult['returnCode']).send({
        type: RESPONSE_TYPE.EMERGENCY_CONTACT,
        data: {},
        message: validationResult['message'],
      });
    }

    const filter = {
      userId: user._id,
    };

    const query = {
      citizen_id: user._id,
      contact_user_id: validationResult.contactUser._id,
      email_address: email_address,
      enable_send_public_message: enable_send_public_message,
    };

    await emergencyContactModel.updateEmergencyContact(EmergencyContact, [
      filter,
      query,
    ]);

    await createChatroomIfNotExist(user._id, validationResult.contactUser._id);

    res.status(200).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {},
      message: 'update emergency contact successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {},
      message: 'internal server error',
    });
  }
};

const sendNotificationToEmergencyContact = async (req, res) => {
  try {
    const token = jwt.getToken(req);
    const user = await jwt.getUserFromToken(token);

    const filter = {
      userId: user._id,
    };

    let contact = await emergencyContactModel.getEmergencyContact(
      EmergencyContact,
      filter,
    );

    if (!contact) {
      return res.status(404).send({
        type: RESPONSE_TYPE.EMERGENCY_CONTACT,
        data: {},
        message: 'emergency contact not found',
      });
    }

    const contactUser = await userModel.getUser(userCollection, {
      _id: contact.contact_user_id,
    });

    // convert Mongo obj to JS obj to add key username
    contact = contact.toObject();
    contact['username'] = contactUser.username;

    const params = {
      members: [user._id, contactUser._id],
    };

    const chatroom = await chatroomModel.getChatroomByMembers(
      chatroomCollection,
      params,
    );

    const contactInfo = {
      chatroom_id: chatroom._id,
      receiver: contact.username,
      citizen: user.username,
      email_address: contact.email_address,
      location: 'CMU-SV Room 224', // TODO: good to have - get location from UI
      status: STATUS_CODE.EMERGENCY,
    };

    // use decorator pattern to attach new behaviors based on citizen's preference
    const notifier = new Notifier();

    if (contact.enable_send_public_message) {
      PublicWallDecorator(notifier);
    }

    if (contact.email_address && contact.email_address.length != 0) {
      EmailDecorator(notifier, emailClient);
    }

    await notifier.send(contactInfo);

    res.status(201).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {contactInfo},
      message: 'notification created',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.EMERGENCY_CONTACT,
      data: {},
      message: 'internal server error',
    });
  }
};

const isValidContact = async (username, contactUsername) => {
  const contactUser = await userModel.getUser(userCollection, {
    username: contactUsername,
  });
  if (!contactUser) {
    return {
      isValid: false,
      returnCode: 404,
      message:
        'citizen not found in social network, please use another citizen as emergency contact',
    };
  }

  if (username == contactUsername) {
    return {
      isValid: false,
      returnCode: 400,
      message:
        "can't set oneself as emergency contact, please use another citizen as emergency contact",
    };
  }

  return {
    isValid: true,
    contactUser: contactUser,
  };
};

export default {
  saveEmergencyContact,
  getEmergencyContact,
  updateEmergencyContact,
  sendNotificationToEmergencyContact,
  setEmailClient,
};
