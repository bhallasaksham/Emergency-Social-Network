const createAnnouncement = (AnnouncementCollection, insertValues) => {
  // connect DB & write data
  return new Promise((resolve, reject) => {
    AnnouncementCollection.create(insertValues, (err, message) => {
      /* istanbul ignore next */
      if (err) {
        reject(err);
      }
      resolve(message);
    });
  });
};

const getAnnouncements = (
  AnnouncementCollection,
  filter,
  batchSize,
  offset,
) => {
  return new Promise((resolve, reject) => {
    AnnouncementCollection.find(filter, (err, message) => {
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

export default {createAnnouncement, getAnnouncements};
