const createNotification = (notificationCollection, insertValues) => {
  return new Promise((resolve, reject) => {
    notificationCollection.create(insertValues, (err, notification) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(notification);
    });
  });
};

const getNotificationsById = (notificationCollection, query) => {
  return new Promise((resolve, reject) => {
    notificationCollection.find(
      {receiver_id: query.receiver_id},
      (err, notifications) => {
        /* istanbul ignore next */
        if (err) {
          reject(err);
        }
        resolve(notifications);
      },
    );
  });
};

const clearNotificationsById = (notificationCollection, query) => {
  return new Promise((resolve, reject) => {
    notificationCollection.deleteMany(
      {receiver_id: query.receiver_id},
      (err, obj) => {
        /* istanbul ignore next */
        if (err) {
          reject(err);
        }
        resolve(obj);
      },
    );
  });
};

export default {
  createNotification,
  getNotificationsById,
  clearNotificationsById,
};
