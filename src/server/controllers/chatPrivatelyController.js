import userModel from '/server/models/userModel';
import {
  User,
  PrivateMessage,
  Chatroom,
  Notification,
} from '/server/models/schema';
import chatroomModel from '/server/models/chatroomModel';
import notificationModel from '/server/models/notificationModel';
import privateMessageModel from '/server/models/privateMessageModel';
import {RESPONSE_TYPE, SOCKET_TYPE} from '/server/util/enum';
import {
  filterInactiveUserById,
  retrieveChatroomUsername,
  retrieveMessageUsername,
  retrieveNotificationUsername,
} from '/server/util/helpers';
import {GetSocketIoServerInstance} from '/socketServer';
import {buildWordFilter} from '/server/util/queryBuilder';
import jwt from '/server/util/jwtSign';

let chatroomCollection = Chatroom;
let notificationCollection = Notification;
let privateMessageCollection = PrivateMessage;
let userCollection = User;

const createChatroom = async (req, res) => {
  try {
    const {sender_name, receiver_name} = req.body;

    const sender = await userModel.getUser(userCollection, {
      username: sender_name,
    });

    const receiver = await userModel.getUser(userCollection, {
      username: receiver_name,
    });

    const params = {
      members: [sender._id, receiver._id],
    };

    // check if chatroom exists or not
    const existChatroom = await chatroomModel.getChatroomByMembers(
      chatroomCollection,
      params,
    );

    if (existChatroom !== undefined) {
      return res.status(409).send({
        type: RESPONSE_TYPE.CHAT,
        data: {},
        message: 'chatroom has already existed',
      });
    }

    const chatroom = await chatroomModel.createChatroom(
      chatroomCollection,
      params,
    );

    res.status(201).send({
      type: RESPONSE_TYPE.CHAT,
      data: {
        id: chatroom._id,
        members: [sender.username, receiver.username],
      },
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.CHAT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getChatroomsByUser = async (req, res) => {
  try {
    const username = req.query.username;

    const user = await userModel.getUser(userCollection, {
      username: username,
    });

    let chatrooms = await chatroomModel.getChatroomsByUser(chatroomCollection, {
      userId: user._id,
    });

    const inactiveUserSet = await filterInactiveUserById();
    chatrooms = chatrooms.filter((chatroom) => {
      return (
        !inactiveUserSet.has(chatroom.members[0].toString()) &&
        !inactiveUserSet.has(chatroom.members[1].toString())
      );
    });

    const formatedChatrooms = await retrieveChatroomUsername(chatrooms);

    res.status(200).send({
      type: RESPONSE_TYPE.CHAT,
      data: {
        chatrooms: formatedChatrooms,
      },
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.CHAT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getChatroomByMembers = async (req, res) => {
  try {
    const sender_name = req.query.sender;
    const receiver_name = req.query.receiver;

    const sender = await userModel.getUser(userCollection, {
      username: sender_name,
    });

    const receiver = await userModel.getUser(userCollection, {
      username: receiver_name,
    });

    const params = {
      members: [sender._id, receiver._id],
    };

    let chatroom = await chatroomModel.getChatroomByMembers(
      chatroomCollection,
      params,
    );

    if (chatroom) {
      chatroom.members = [sender.username, receiver.username];
    }

    res.status(200).send({
      type: RESPONSE_TYPE.CHAT,
      data: chatroom,
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.CHAT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getPrivateMessage = async (req, res) => {
  try {
    const filter = buildWordFilter(req.query, 'message');
    filter['chatroom_id'] = req.query.chatroom_id;

    let messages = await privateMessageModel.getPrivateMessage(
      privateMessageCollection,
      filter,
      req.query.limit !== undefined ? req.query.limit : 100,
      req.query.offset !== undefined ? req.query.offset : 0,
    );

    const newMesages = await retrieveMessageUsername(messages);

    res.status(200).send({
      type: RESPONSE_TYPE.CHAT,
      data: {messages: newMesages},
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.CHAT,
      data: {},
      message: 'internal server error',
    });
  }
};

// createPrivateMessageSendSocketEvent creates a private msg in DB, send socket event and store notification if user is offline
const createPrivateMessageSendSocketEvent = async (
  sender_name,
  receiver_name,
  msg,
) => {
  const sender = await userModel.getUser(userCollection, {
    username: sender_name,
  });

  msg['status'] = sender.status;
  msg['sender_id'] = sender._id;

  const receiver = await userModel.getUser(userCollection, {
    username: receiver_name,
  });

  let privateMessage = await privateMessageModel.createPrivateMessage(
    privateMessageCollection,
    msg,
  );
  privateMessage = privateMessage.toObject();
  privateMessage['sender_name'] = sender.username;

  if (!receiver.online) {
    await createNotification({
      chatroomId: privateMessage.chatroom_id,
      senderId: sender._id.toString(),
      receiverId: receiver._id.toString(),
      receiverName: receiver.username,
      timestamp: privateMessage.timestamp,
      status: privateMessage.status,
      message: privateMessage.message,
    });
  }

  // emit private msg to chatroom only
  GetSocketIoServerInstance()
    .to(privateMessage.chatroom_id.toString())
    .emit(SOCKET_TYPE.PRIVATE_MESSAGE, privateMessage);

  return privateMessage;
};

const savePrivateMessage = async (req, res) => {
  try {
    const {sender_name, receiver_name, message} = req.body;

    const sender = await userModel.getUser(userCollection, {
      username: sender_name,
    });

    const receiver = await userModel.getUser(userCollection, {
      username: receiver_name,
    });

    const params = {
      members: [sender._id, receiver._id],
    };

    const chatroom = await chatroomModel.getChatroomByMembers(
      chatroomCollection,
      params,
    );

    if (chatroom === undefined) {
      return res.status(404).send({
        type: RESPONSE_TYPE.MESSAGE,
        data: {},
        message: 'chatroom not found',
      });
    }

    const privateMessage = await createPrivateMessageSendSocketEvent(
      sender_name,
      receiver_name,
      {
        chatroom_id: chatroom._id,
        sender_name: sender_name,
        timestamp: Math.floor(new Date().getTime() / 1000), // timestamp, ex: 1665810250
        message: message,
      },
    );

    res.status(201).send({
      type: RESPONSE_TYPE.CHAT,
      data: {
        message: privateMessage,
      },
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.MESSAGE,
      data: {},
      message: 'internal server error',
    });
  }
};

const createNotification = async ({
  chatroomId,
  senderId,
  receiverId,
  receiverName,
  timestamp,
  status,
  message,
}) => {
  try {
    const params = {
      chatroom_id: chatroomId,
      sender_id: senderId,
      receiver_id: receiverId,
      receiver_name: receiverName,
      timestamp: timestamp,
      status: status,
      message: message,
    };
    // check if chatroom exists or not
    const notification = await notificationModel.createNotification(
      notificationCollection,
      params,
    );
    return notification;
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return err;
  }
};

const getNotificationsByUser = async (req, res) => {
  try {
    const token = jwt.getToken(req);
    const user = await jwt.getUserFromToken(token);

    const notifications = await notificationModel.getNotificationsById(
      notificationCollection,
      {
        receiver_id: user._id.toString(),
      },
    );

    let newNotifications = [];

    if (notifications.length != 0) {
      newNotifications = await retrieveNotificationUsername(notifications);

      await notificationModel.clearNotificationsById(notificationCollection, {
        receiver_id: user._id.toString(),
      });
    }
    res.status(200).send({
      type: RESPONSE_TYPE.CHAT,
      data: {notifications: newNotifications},
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.CHAT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getChatroomModelsByUserModel = async (username) => {
  try {
    const user = await userModel.getUser(userCollection, {
      username: username,
    });

    let chatrooms = await chatroomModel.getChatroomsByUser(chatroomCollection, {
      userId: user._id,
    });

    const newChatrooms = await retrieveChatroomUsername(chatrooms);

    return newChatrooms;
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return err;
  }
};

export default {
  createChatroom,
  getChatroomsByUser,
  savePrivateMessage,
  getPrivateMessage,
  getNotificationsByUser,
  getChatroomModelsByUserModel,
  getChatroomByMembers,
  createPrivateMessageSendSocketEvent,
};
