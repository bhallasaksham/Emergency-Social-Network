const createMessage = (MessageCollection, insertValues) => {
  // connect DB & write data
  return new Promise((resolve, reject) => {
    MessageCollection.create(insertValues, (err, message) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(message);
    });
  });
};

const getMessages = (MessageCollection, filter, batchSize, offset) => {
  return new Promise((resolve, reject) => {
    MessageCollection.find(filter, (err, message) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(message);
    })
      .sort({timestamp: -1}) // Sorting to chronological order
      .limit(batchSize)
      .skip(offset);
  });
};

const deleteAllMessages = (MessageCollection) => {
  return new Promise((resolve, reject) => {
    MessageCollection.deleteMany({}, (err) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

export default {createMessage, getMessages, deleteAllMessages};
