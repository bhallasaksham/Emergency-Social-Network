const getPrivateMessage = (
  PrivateMessageCollection,
  filter,
  batchSize,
  offset,
) => {
  return new Promise((resolve, reject) => {
    PrivateMessageCollection.find(filter, (err, obj) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(obj);
    })
      .sort({timestamp: -1}) // Sorting to chronological order
      .limit(batchSize)
      .skip(offset);
  });
};

const createPrivateMessage = (PrivateMessageCollection, insertValues) => {
  // connect DB & write data
  return new Promise((resolve, reject) => {
    PrivateMessageCollection.create(insertValues, (err, message) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(message);
    });
  });
};

export default {
  createPrivateMessage,
  getPrivateMessage,
};
