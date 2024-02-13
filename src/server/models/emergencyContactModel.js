const createEmergencyContact = (EmergencyContactCollection, query) => {
  // connect DB & write data
  return new Promise((resolve, reject) => {
    EmergencyContactCollection.create(query, (err, user) => {
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
};

const getEmergencyContact = (EmergencyContactCollection, query) => {
  return new Promise((resolve, reject) => {
    EmergencyContactCollection.findOne(
      {citizen_id: query.userId},
      (err, user) => {
        /* istanbul ignore next */
        if (err) {
          reject(err);
        }
        resolve(user);
      },
    );
  });
};

const updateEmergencyContact = (EmergencyContactCollection, query) => {
  return new Promise((resolve, reject) => {
    EmergencyContactCollection.updateOne(...query, (err, user) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(user);
    });
  });
};

export default {
  createEmergencyContact,
  getEmergencyContact,
  updateEmergencyContact,
};
