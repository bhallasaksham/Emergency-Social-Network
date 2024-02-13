import messageModel from '/server/models/messageModel';
import {Message, User} from '/server/models/schema';
import userModel from '/server/models/userModel';
import jwtSign from '/server/util/jwtSign';
import {buildWordFilter} from '/server/util/queryBuilder';
import {RESPONSE_TYPE, SOCKET_TYPE} from '/server/util/enum';
import {
  filterInactiveUserByUsername,
  getUsersByIds,
} from '/server/util/helpers';
import {GetSocketIoServerInstance} from '/socketServer';
import {isPerfMode} from '../util/perfTestMode';

let messageCollection = Message;
const userCollection = User;

const createMessageAndSendSocketEvent = async (msg, username) => {
  await messageModel.createMessage(messageCollection, msg);

  // when perf mode is on, no one should be able to access the msg via both API & socket event
  if (!isPerfMode()) {
    // emit message via socket for dynamically update
    GetSocketIoServerInstance().emit(SOCKET_TYPE.PUBLIC_MESSAGE, {
      sender_name: username,
      timestamp: msg.timestamp,
      status: msg.status,
      message: msg.message,
    });
  }
};

const saveMessage = async (req, res) => {
  try {
    const token = jwtSign.getToken(req);

    // decode token & get username
    const decodedToken = jwtSign.decodeToken(token);
    const user_id = decodedToken.id;
    const user = await userModel.getUser(userCollection, {
      username: decodedToken.username,
    });

    const msg = {
      user_id: user_id,
      message: req.body.message,
      timestamp: Math.floor(new Date().getTime() / 1000), // timestamp, ex: 1665810250
      status: user.status,
    };

    createMessageAndSendSocketEvent(msg, decodedToken.username);

    res.status(201).send({
      type: RESPONSE_TYPE.MESSAGE,
      data: {
        messages: {
          sender_name: decodedToken.username,
          timestamp: msg.timestamp,
          message: msg.message,
          status: msg.status,
        },
      },
      message: 'message create successfully',
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

const getMessages = async (req, res) => {
  try {
    const filter = buildWordFilter(req.query, 'message');

    let messagesList = await messageModel.getMessages(
      messageCollection,
      filter,
      req.query.limit !== undefined ? req.query.limit : 100,
      req.query.offset !== undefined ? req.query.offset : 0,
    );

    const userIds = new Set();
    for (let i = 0; i < messagesList.length; i++) {
      userIds.add(messagesList[i].user_id);
    }

    const users = await getUsersByIds(userIds);

    for (let i = 0; i < messagesList.length; i++) {
      const user = users.find(
        (user) => user._id.toString() === messagesList[i].user_id,
      );
      messagesList[i]['username'] = user.username;
    }

    const inactiveUserSet = await filterInactiveUserByUsername();

    const messages = [];
    for (let i = 0; i < messagesList.length; i++) {
      if (inactiveUserSet.has(messagesList[i].username)) {
        continue;
      }

      messages.push({
        id: messagesList[i]._id,
        sender_name: messagesList[i].username,
        timestamp: messagesList[i].timestamp,
        status: messagesList[i].status,
        message: messagesList[i].message,
      });
    }

    res.status(200).send({
      type: RESPONSE_TYPE.MESSAGE,
      data: {messages},
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

const deleteAllMessages = async () => {
  try {
    messageModel.deleteAllMessages(messageCollection);
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
  }
};

const setMessageCollection = (collection) => {
  messageCollection = collection;
};

export default {
  saveMessage,
  getMessages,
  setMessageCollection,
  deleteAllMessages,
  createMessageAndSendSocketEvent,
};
