const createDonationEntry = (DonationCollection, insertValues) => {
  // connect DB & write data
  return new Promise((resolve, reject) => {
    DonationCollection.create(insertValues, (err, resource) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(resource);
    });
  });
};

const getDonationResources = (DonationCollection, filter) => {
  return new Promise((resolve, reject) => {
    DonationCollection.find(filter, (err, resource) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(resource);
    });
  });
};

const updateDonation = (DonationCollection, filter) => {
  return new Promise((resolve, reject) => {
    DonationCollection.updateOne(...filter, (err, donation) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(donation);
    });
  });
};

const deleteDonationEntry = (DonationCollection, filter) => {
  return new Promise((resolve, reject) => {
    DonationCollection.deleteOne(filter, (err) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve();
    });
  });
};

export default {
  createDonationEntry,
  getDonationResources,
  updateDonation,
  deleteDonationEntry,
};
