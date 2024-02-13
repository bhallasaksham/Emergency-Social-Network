import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
} from '../integration/integration-util';
import {
  Notifier,
  PublicWallDecorator,
  EmailDecorator,
  sendgridClient,
} from '/server/controllers/notifier';
import {STATUS_CODE} from '/server/util/enum';
import chatroomModel from '/server/models/chatroomModel';
import privateMessageModel from '/server/models/privateMessageModel';
import messageModel from '/server/models/messageModel';
import {Chatroom, PrivateMessage, Message} from '/server/models/schema';
import {FakeEmailClient} from '../integration/integration-util';

beforeAll(async () => {
  setUpServerAndDB();
});

afterEach(async () => {
  await cleanCollectionData();
});

afterAll(async () => {
  await tearDownServerAndDB();
});

test('basic notifier should create a private message', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  const filter = [adam.username, shangyi.username];

  const params = {
    members: filter,
  };

  // act
  const chatroom = await chatroomModel.createChatroom(Chatroom, params);

  const contactInfo = {
    chatroom_id: chatroom._id,
    receiver: shangyi.username,
    citizen: adam.username,
    email_address: 'hello@gmail.com',
    location: 'CMU-SV Room 224',
    status: STATUS_CODE.UNDEFINED,
  };

  const notifier = new Notifier();

  await notifier.send(contactInfo);

  const messages = await privateMessageModel.getPrivateMessage(PrivateMessage, {
    chatroomId: chatroom._id,
  });

  // assert
  expect(messages[0].chatroom_id).toBe(chatroom._id.toString());
  expect(messages[0].sender_id).toBe(adam.id);
  expect(messages[0].message).toBe(
    "It's an earthquake!! I need help!! My Location: CMU-SV Room 224",
  );
  expect(messages[0].status).toBe(STATUS_CODE.UNDEFINED);
});

test('basic notifier wrap w/ public wall decorator should create a public message', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();
  const filter = [adam.id, shangyi.id];

  const params = {
    members: filter,
  };

  const chatroom = await chatroomModel.createChatroom(Chatroom, params);

  const contactInfo = {
    chatroom_id: chatroom._id,
    receiver: shangyi.username,
    citizen: adam.username,
    email_address: 'hello@gmail.com',
    location: 'CMU-SV Room 224',
    status: STATUS_CODE.EMERGENCY,
  };

  // act
  const notifier = new Notifier();
  PublicWallDecorator(notifier);
  await notifier.send(contactInfo);

  // assert
  const messages = await messageModel.getMessages(Message);
  expect(messages[0].message).toBe(
    "It's an earthquake!! I need help!! My Location: CMU-SV Room 224",
  );
  expect(messages[0].status).toBe(STATUS_CODE.EMERGENCY);
});

test('basic notifier + Email decorator w/ fake client', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();
  const filter = [adam.username, shangyi.username];

  const params = {
    members: filter,
  };

  const chatroom = await chatroomModel.createChatroom(Chatroom, params);

  const contactInfo = {
    chatroom_id: chatroom._id,
    receiver: shangyi.username,
    citizen: adam.username,
    email_address: 'hello@gmail.com',
    location: 'CMU-SV Room 224',
    status: STATUS_CODE.EMERGENCY,
  };

  // act
  const notifier = new Notifier();
  const client = new FakeEmailClient();

  EmailDecorator(notifier, client);

  await notifier.send(contactInfo);

  const contactInfoFromFake = client.contactInfo;

  // assert client receive correct data
  expect(contactInfoFromFake).toHaveProperty('to', 'hello@gmail.com');
  expect(contactInfoFromFake).toHaveProperty(
    'from',
    'emergencysocialnetworkf22sb1@gmail.com',
  );
  expect(contactInfoFromFake['subject']).toContain('Needs Your Help');
  expect(contactInfoFromFake['html']).toContain('<!DOCTYPE html>');
});

test.skip('basic notifier + Email decorator w/ real client', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();
  const filter = [adam.username, shangyi.username];

  const params = {
    members: filter,
  };

  const chatroom = await chatroomModel.createChatroom(Chatroom, params);

  const contactInfo = {
    chatroom_id: chatroom._id,
    receiver: shangyi.username,
    citizen: adam.username,
    email_address: 'shang.yi.yu.tw@gmail.com',
    location: 'CMU-SV Room 224',
    status: STATUS_CODE.EMERGENCY,
  };

  // act
  const notifier = new Notifier();
  EmailDecorator(notifier, sendgridClient);
  notifier.send(contactInfo);
});
