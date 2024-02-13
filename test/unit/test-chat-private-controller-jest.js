import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
} from '../integration/integration-util';
import chatroomModel from '/server/models/chatroomModel';
import chatPrivatelyController from '/server/controllers/chatPrivatelyController';
import {Chatroom} from '/server/models/schema';
import mongoose from 'mongoose';

beforeAll(async () => {
  setUpServerAndDB();
});

afterEach(async () => {
  await cleanCollectionData();
});

afterAll(async () => {
  await tearDownServerAndDB();
});

test('Controller can get chatroom by members from DB', async () => {
  const adam = await createUser();
  const shangyi = await createUser();
  const elizabeth = await createUser();

  // arrange
  await chatroomModel.createChatroom(Chatroom, {
    members: [
      mongoose.Types.ObjectId(adam.id),
      mongoose.Types.ObjectId(shangyi.id),
    ],
  });
  await chatroomModel.createChatroom(Chatroom, {
    members: [
      mongoose.Types.ObjectId(elizabeth.id),
      mongoose.Types.ObjectId(shangyi.id),
    ],
  });
  await chatroomModel.createChatroom(Chatroom, {
    members: [
      mongoose.Types.ObjectId(adam.id),
      mongoose.Types.ObjectId(elizabeth.id),
    ],
  });

  const chatrooms = await chatPrivatelyController.getChatroomModelsByUserModel(
    adam.username,
  );

  // assert
  expect(chatrooms.length).toBe(2);
  for (let i = 0; i < chatrooms.length; i++) {
    expect(chatrooms[i].members).toContainEqual(adam.username);
  }
});
