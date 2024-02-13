import {STATUS_CODE} from '/server/util/enum';
import messageModel from '/server/models/messageModel';
import {Message} from 'server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

// Promise way to write ut
test('Can save public a message to DB', () => {
  // arrange
  const msg = {
    user_id: 'hakanID',
    message: 'happy weekend',
    timestamp: Math.floor(new Date().getTime() / 1000), // timestamp, ex: 1665810250
    status: STATUS_CODE.OK,
  };

  // act
  return messageModel.createMessage(Message, msg).then((message) => {
    // assert
    expect(message.user_id).toBe('hakanID');
    expect(message.message).toBe('happy weekend');
    expect(message.status).toBe(STATUS_CODE.OK);
  });
});

// async/ await way to write ut
test('Can get public messages from DB', async () => {
  // arrange
  const msg = {
    user_id: 'hakanID',
    message: 'happy weekend',
    timestamp: Math.floor(new Date().getTime() / 1000), // timestamp, ex: 1665810250
    status: STATUS_CODE.OK,
  };
  await messageModel.createMessage(Message, msg);

  // act
  const dbMessages = await messageModel.getMessages(Message);

  // assert
  expect(dbMessages[0].user_id).toBe('hakanID'); // toContainEqual not working, figure it out later
});
