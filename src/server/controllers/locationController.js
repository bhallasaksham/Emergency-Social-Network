import {RESPONSE_TYPE} from '/server/util/enum';
import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';
const userCollection = User;
const getUserLocationPreference = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await userModel.getUser(userCollection, {username: username});
    return res.status(200).send({
      type: RESPONSE_TYPE.LOCATION,
      data: user.trackLocation,
      message: 'success!',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.LOCATION,
      data: {},
      message: 'internal server error',
    });
  }
};

const updateUserLocationPreference = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await userModel.getUser(userCollection, {username: username});
    await userModel.updateUserInfo(userCollection, [
      {_id: user._id},
      {trackLocation: req.body.preference},
    ]);
    return res.status(200).send({
      type: RESPONSE_TYPE.LOCATION,
      data: {},
      message: 'success!',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.LOCATION,
      data: {},
      message: 'internal server error',
    });
  }
};

const updateUserLocation = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await userModel.getUser(userCollection, {username: username});
    await userModel.updateUserInfo(userCollection, [
      {_id: user._id},
      {
        location: {
          type: 'Point',
          coordinates: [req.body.longitude, req.body.latitude],
        },
      },
    ]);
    return res.status(200).send({
      type: RESPONSE_TYPE.LOCATION,
      data: {},
      message: 'success!',
    });
  } catch (err) {
    /* istanbul ignore next */
    console.log(err);
    /* istanbul ignore next */
    return res.status(500).send({
      type: RESPONSE_TYPE.LOCATION,
      data: {},
      message: 'internal server error',
    });
  }
};

const getUserLocation = async (req, res) => {
  try {
    const username = req.params.username;
    const user = await userModel.getUser(userCollection, {username: username});
    return res.status(200).send({
      type: RESPONSE_TYPE.LOCATION,
      data: user.location,
      message: 'success!',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.LOCATION,
      data: {},
      message: 'internal server error',
    });
  }
};

export default {
  getUserLocationPreference,
  updateUserLocationPreference,
  updateUserLocation,
  getUserLocation,
};
