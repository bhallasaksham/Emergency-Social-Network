const createChatroom = (chatroomCollection, insertValues) => {
  return new Promise((resolve, reject) => {
    chatroomCollection.create(insertValues, (err, chatroom) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(chatroom);
    });
  });
};

const getChatroomByMembers = (chatroomCollection, query) => {
  return new Promise((resolve, reject) => {
    chatroomCollection.find(
      {members: {$all: query.members}},
      (err, chatroom) => {
        /* istanbul ignore next */
        if (err) {
          reject(err);
        }
        resolve(chatroom[0]);
      },
    );
  });
};

const getChatroomsByUser = (chatroomCollection, query) => {
  return new Promise((resolve, reject) => {
    chatroomCollection.find({members: {$in: query.userId}}, (err, chatroom) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(chatroom);
    });
  });
};

export default {
  createChatroom,
  getChatroomByMembers,
  getChatroomsByUser,
};
