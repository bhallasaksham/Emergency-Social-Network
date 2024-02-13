import {STATUS_CODE} from '/server/util/enum';
import notificationModel from '/server/models/notificationModel';
import {Notification} from 'server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

test('Can save notification to DB', () => {
  // arrange
  const stubNotification = {
    chatroom_id: 'chatroom_id',
    sender_id: 'hakan-id',
    receiver_id: 'cecile-id',
    timestamp: '1665810250',
    status: STATUS_CODE.OK,
    message: 'i am notification',
  };

  // act
  return notificationModel
    .createNotification(Notification, stubNotification)
    .then((notification) => {
      // assert
      expect(notification.receiver_id).toBe(stubNotification.receiver_id);
      expect(notification.timestamp).toBe(stubNotification.timestamp);
      expect(notification.message).toBe(stubNotification.message);
      expect(notification.status).toBe(stubNotification.status);
    });
});

test('Can get notification from DB', async () => {
  // arrange
  const stubNotification = {
    chatroom_id: 'chatroom_id',
    sender_id: 'sender_id',
    receiver_id: 'receiver_id',
    timestamp: '1665810250',
    status: STATUS_CODE.OK,
    message: 'i am notification',
  };

  await notificationModel.createNotification(Notification, stubNotification);

  // act
  const notifications = await notificationModel.getNotificationsById(
    Notification,
    {receiver_id: stubNotification.receiver_id},
  );

  // assert
  // toContainEqual not working, figure it out later
  expect(notifications[0].sender_id).toBe(stubNotification.sender_id);
  expect(notifications[0].receiver_name).toBe(stubNotification.receiver_name);
  expect(notifications[0].receiver_id).toBe(stubNotification.receiver_id);
  expect(notifications[0].message).toBe(stubNotification.message);
  expect(notifications[0].status).toBe(stubNotification.status);
  expect(notifications[0].timestamp).toBe(stubNotification.timestamp);
});

test('Can clear notification by user from DB', async () => {
  // arrange
  const stubNotification = {
    chatroom_id: 'chatroom_id',
    sender_id: 'hakan_id',
    receiver_id: 'cecile_id',
    timestamp: '1665810250',
    status: STATUS_CODE.OK,
    message: 'i am notification',
  };

  // act
  await notificationModel.createNotification(Notification, stubNotification);
  await notificationModel.clearNotificationsById(Notification, {
    receiver_id: stubNotification.receiver_id,
  });

  // act
  const notifications = await notificationModel.getNotificationsById(
    Notification,
    {receiver_id: stubNotification.receiver_id},
  );

  // assert
  expect(notifications.length).toBe(0);
});
