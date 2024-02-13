import mapModel from '/server/models/mapModel';
import userModel from '/server/models/userModel';
import {Map, User} from '/server/models/schema';
import {RESPONSE_TYPE} from '/server/util/enum';
import {
  filterInactiveUserByUsername,
  retrieveMarkerUsername,
} from '/server/util/helpers';

const mapCollection = Map;
const userCollection = User;

const createMarker = async (req, res) => {
  try {
    const {username, longitude, latitude, status} = req.body;

    const user = await userModel.getUser(userCollection, {
      username: username,
    });

    // check if user exists or not
    const existMarker = await mapModel.getMarker(mapCollection, {
      user_id: user._id,
    });

    if (existMarker !== null) {
      // delete exist marker
      await mapModel.deleteMarker(mapCollection, existMarker._id);
    }

    let newMarker = {
      user_id: user._id,
      longitude,
      latitude,
      status,
    };
    let marker = await mapModel.createMarker(mapCollection, newMarker);
    marker = marker.toObject();
    marker['username'] = user.username;

    res.status(201).send({
      type: RESPONSE_TYPE.MAP,
      data: {
        marker,
      },
      message: 'marker create successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
  }
};

const getMarkers = async (req, res) => {
  let markers = await mapModel.getAllMarkers(mapCollection, {});

  let newMarkers = await retrieveMarkerUsername(markers);

  const inactiveUserSet = await filterInactiveUserByUsername();

  newMarkers = newMarkers.filter((maker) => {
    return !inactiveUserSet.has(maker.username);
  });

  res.status(201).send({
    type: RESPONSE_TYPE.MAP,
    data: {
      markers: newMarkers,
    },
    message: 'marker find successfully',
  });
};

export default {
  createMarker,
  getMarkers,
};
