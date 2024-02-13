const createMarker = (MapCollection, insertValues) => {
  return new Promise((resolve) => {
    MapCollection.create(insertValues, (err, user) => {
      resolve(user);
    });
  });
};

const getMarker = (MapCollection, query) => {
  return new Promise((resolve) => {
    MapCollection.findOne({username: query.username}, (err, user) => {
      resolve(user);
    });
  });
};

const getAllMarkers = (MapCollection, filter) => {
  return new Promise((resolve) => {
    MapCollection.find(filter, (err, user) => {
      resolve(user);
    });
  });
};

const deleteMarker = (MapCollection, id) => {
  return new Promise((resolve) => {
    MapCollection.findByIdAndRemove(id, () => {
      resolve();
    });
  });
};

export default {
  createMarker,
  getMarker,
  getAllMarkers,
  deleteMarker,
};
