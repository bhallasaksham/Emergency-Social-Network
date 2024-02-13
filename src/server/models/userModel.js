const createUser = (UserCollection, insertValues) => {
  // connect DB & write data
  return new Promise((resolve, reject) => {
    UserCollection.create(insertValues, (err, user) => {
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
};

const getUser = (UserCollection, query) => {
  return new Promise((resolve, reject) => {
    UserCollection.findOne(query, (err, user) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
};

const getUsers = (UserCollection, filter) => {
  return new Promise((resolve, reject) => {
    UserCollection.find(filter, (err, user) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
};

const getInactiveUsers = (UserCollection) => {
  return new Promise((resolve, reject) => {
    UserCollection.find({account_status: 'inactive'}, (err, user) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
};

const updateUserInfo = (UserCollection, query) => {
  return new Promise((resolve, reject) => {
    UserCollection.findOneAndUpdate(
      ...query,
      {returnDocument: 'after'},
      (err, user) => {
        if (err) {
          reject(err);
        }
        resolve(user);
      },
    );
  });
};

export default {
  createUser,
  getUser,
  getUsers,
  updateUserInfo,
  getInactiveUsers,
};
