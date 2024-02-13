import {STATUS_CODE} from '/server/util/enum';
import chatroomModel from '/server/models/chatroomModel';
import privateMessageModel from '/server/models/privateMessageModel';
import {Chatroom, PrivateMessage} from '/server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

test('Can create chatroom to DB', () => {
  // arrange
  const params = {
    members: ['user-1', 'user-2'],
  };

  // act
  return chatroomModel.createChatroom(Chatroom, params).then((chatroom) => {
    // assert
    expect(chatroom.members.length).toBe(2);
    expect(chatroom.members).toContainEqual('user-1');
    expect(chatroom.members).toContainEqual('user-2');
  });
});

test('Can get chatroom by members from DB', async () => {
  // arrange
  const params = {
    members: ['user-1', 'user-2'],
  };

  // act
  await chatroomModel.createChatroom(Chatroom, params);

  const chatroom = await chatroomModel.getChatroomByMembers(Chatroom, params);

  // assert
  expect(chatroom).not.toBeUndefined();
  expect(chatroom.members).toContainEqual('user-1');
  expect(chatroom.members).toContainEqual('user-2');
});

test('Can get chatrooms by a user from DB', async () => {
  // arrange
  const paramsUser1User2 = {
    members: ['user-1', 'user-2'],
  };
  const paramsUser1User3 = {
    members: ['user-1', 'user-3'],
  };

  // act
  await chatroomModel.createChatroom(Chatroom, paramsUser1User2);
  await chatroomModel.createChatroom(Chatroom, paramsUser1User3);
  const chatrooms = await chatroomModel.getChatroomsByUser(Chatroom, {
    userId: 'user-1',
  });

  // assert
  expect(chatrooms[0].members).toContainEqual('user-1');
  expect(chatrooms[1].members).toContainEqual('user-1');
});

test('Can create a private memssage in DB', async () => {
  // arrange
  const filter = ['user-1', 'user-2'];

  const params = {
    members: filter,
  };

  // act
  const chatroom = await chatroomModel.createChatroom(Chatroom, params);

  const insertValue = {
    chatroom_id: chatroom._id,
    sender_id: 'user-1',
    timestamp: 1665810250,
    status: STATUS_CODE.OK,
    message: 'hello world',
  };

  const privateMsg = await privateMessageModel.createPrivateMessage(
    PrivateMessage,
    insertValue,
  );

  // assert
  expect(privateMsg.message).toBe('hello world');
  expect(privateMsg.sender_id).toBe('user-1');
});

test('Can get private memssages from chatrooms DB', async () => {
  // arrange
  const user1 = 'user' + Math.floor(new Date().getTime() / 1000);
  const user2 = 'user' + Math.floor(new Date().getTime() / 1000);
  const filter = [user1, user2];

  const params = {
    members: filter,
  };

  // act
  const chatroom = await chatroomModel.createChatroom(Chatroom, params);

  const insertValue = {
    chatroom_id: chatroom._id,
    sender_id: user1,
    timestamp: 1665810250,
    status: STATUS_CODE.OK,
    message: 'hello world',
  };

  await privateMessageModel.createPrivateMessage(PrivateMessage, insertValue);
  const messages = await privateMessageModel.getPrivateMessage(PrivateMessage, {
    chatroomId: chatroom._id,
  });

  // assert
  expect(messages[0].message).toBe('hello world');
  expect(messages[0].sender_id).toBe(user1);
});
