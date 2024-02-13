import {User} from '/server/models/schema';
import userModel from '/server/models/userModel';

let userCollection = User;

const deepCopy = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

const getUsersByIds = async (userIds) => {
  const users = await userModel.getUsers(userCollection, {
    _id: {$in: Array.from(userIds)},
  });
  return users;
};

const filterInactiveUserById = async () => {
  const inactiveUsers = await userModel.getInactiveUsers(userCollection);
  const inactiveUserIdList = inactiveUsers.map((user) => {
    return user._id.toString();
  });
  const inactiveUserSet = new Set(inactiveUserIdList);

  return inactiveUserSet;
};

const filterInactiveUserByUsername = async () => {
  const inactiveUsers = await userModel.getInactiveUsers(userCollection);
  const inactiveUsernameList = inactiveUsers.map((user) => {
    return user.username;
  });
  const inactiveUserSet = new Set(inactiveUsernameList);

  return inactiveUserSet;
};

const retrieveChatroomUsername = async (chatrooms) => {
  const newChatrooms = deepCopy(chatrooms);
  const userIds = new Set();
  for (let i = 0; i < chatrooms.length; i++) {
    userIds.add(chatrooms[i].members[0]);
    userIds.add(chatrooms[i].members[1]);
  }

  // retrieve user documents by user ID list
  const users = await getUsersByIds(userIds);

  for (let i = 0; i < chatrooms.length; i++) {
    const firstMember = users.find(
      (x) => x._id.toString() == chatrooms[i].members[0].toString(),
    );
    const secondMember = users.find(
      (x) => x._id.toString() == chatrooms[i].members[1].toString(),
    );
    newChatrooms[i].members = [firstMember.username, secondMember.username];
  }

  return newChatrooms;
};

const retrieveMessageUsername = async (messages) => {
  const newMessages = deepCopy(messages);
  const userIds = new Set();
  for (let i = 0; i < messages.length; i++) {
    userIds.add(messages[i].sender_id);
  }

  const users = await getUsersByIds(userIds);

  for (let i = 0; i < messages.length; i++) {
    const user = users.find(
      (user) => user._id.toString() === messages[i].sender_id,
    );
    newMessages[i] = messages[i].toObject();
    newMessages[i].sender_name = user.username;
  }
  return newMessages;
};

const retrieveNotificationUsername = async (notifications) => {
  const userIds = new Set([notifications[0].receiver_id]);
  const newNotifications = deepCopy(notifications);
  for (let i = 0; i < notifications.length; i++) {
    userIds.add(notifications[i].sender_id);
  }

  const users = await getUsersByIds(userIds);

  const receiver = users.find(
    (user) => user._id.toString() === notifications[0].receiver_id,
  );
  for (let i = 0; i < notifications.length; i++) {
    const user = users.find(
      (user) => user._id.toString() === notifications[i].sender_id,
    );
    newNotifications[i] = notifications[i].toObject();
    newNotifications[i].sender_name = user.username;
    newNotifications[i].receiver_name = receiver.username;
  }
  return newNotifications;
};

const retrieveMarkerUsername = async (markers) => {
  const newMarkers = deepCopy(markers);
  const userIds = new Set();
  for (let i = 0; i < markers.length; i++) {
    userIds.add(markers[i].user_id);
  }

  // retrieve user documents by user ID list
  const users = await getUsersByIds(userIds);

  for (let i = 0; i < markers.length; i++) {
    newMarkers[i] = markers[i].toObject();
    newMarkers[i].username = users.find(
      (x) => x._id.toString() === markers[i].user_id,
    ).username;
  }

  return newMarkers;
};

export {
  filterInactiveUserById,
  filterInactiveUserByUsername,
  retrieveChatroomUsername,
  retrieveMessageUsername,
  retrieveNotificationUsername,
  retrieveMarkerUsername,
  getUsersByIds,
  deepCopy,
};
