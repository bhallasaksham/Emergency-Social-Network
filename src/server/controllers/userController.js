import {hashSync, compareSync} from 'bcrypt';
import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';
import jwt from '/server/util/jwtSign';
import {
  RESPONSE_TYPE,
  SOCKET_TYPE,
  USER_TYPE,
  ACCOUNT_STATUS,
} from '/server/util/enum';
import {GetSocketIoServerInstance} from '/socketServer';
import {buildUserFilter} from '/server/util/queryBuilder';
import {STATUS_CODE} from '../util/enum';

const userCollection = User;

const register = async (req, res) => {
  try {
    const {username, password} = req.body;

    let saltRounds = 10;
    let newUser = {
      username: username.toLowerCase(),
      password: hashSync(password, saltRounds),
      online: true,
    };
    const user = await userModel.createUser(userCollection, newUser);

    const token = jwt.signToken(user._id, user.username);

    // emit online user message into socket
    await updateOnlineStatus(token, true);

    res.status(201).send({
      type: RESPONSE_TYPE.REGISTER,
      data: {
        user: {
          token: 'Bearer ' + token,
          username: user.username,
          user_type: user.user_type,
          id: user._id,
        },
      },
      message: 'user create successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    // this will be DB error, so return 500 as an internal server error
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.LOGIN,
      data: {},
      message: 'internal server error',
    });
  }
};

const login = async (req, res) => {
  try {
    const {username, password} = req.body;

    const user = await userModel.getUser(userCollection, {
      username: username.toLowerCase(),
    });

    if (!user) {
      // user not found
      return res.status(404).send({
        type: RESPONSE_TYPE.LOGIN,
        data: {user: {}},
        message: 'user not found',
      });
    }

    // inactive user should now allow login based on I5 use case
    // https://docs.google.com/document/d/10YoJi1llAiDIGQnoFHb5-EKarz2M2N-pYOHi8bRej7w/edit?usp=sharing
    if (user.account_status == ACCOUNT_STATUS.INACTIVE) {
      return res.status(401).send({
        type: RESPONSE_TYPE.LOGIN,
        data: {},
        message: 'your account is inactive, please contact admin for help',
      });
    }

    // incorrect password
    if (!compareSync(password, user.password)) {
      return res.status(401).send({
        type: RESPONSE_TYPE.LOGIN,
        data: {},
        message: 'incorrect username or password',
      });
    }

    const token = jwt.signToken(user._id, user.username);
    // emit online user message into socket
    await updateOnlineStatus(token, true);

    return res.status(200).send({
      type: RESPONSE_TYPE.LOGIN,
      data: {
        user: {
          // standard jwt practice to user bearer before token
          token: 'Bearer ' + token,
          username: user.username,
          user_type: user.user_type,
          id: user._id,
        },
      },
      message: 'login success',
    });
  } catch (err) /* istanbul ignore next */ {
    // this will be DB error, so return 500 as an internal server error
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.LOGIN,
      data: {},
      message: 'internal server error',
    });
  }
};

const getUser = async (username) => {
  const user = await userModel.getUser(userCollection, {username: username});
  return user;
};

const logout = async (req, res) => {
  try {
    const token = jwt.getToken(req);
    // emit online user message into socket
    await updateOnlineStatus(token, false);

    return res.status(200).send({
      type: RESPONSE_TYPE.LOGOUT,
      data: {},
      message: 'logout success',
    });
  } catch (err) /* istanbul ignore next */ {
    // this will be DB error, so return 500 as an internal server error
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.LOGOUT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getUsers = async (req, res) => {
  try {
    const filter = buildUserFilter(req.query);

    const result = await userModel.getUsers(userCollection, filter);
    const response = result.map((user) => {
      return {
        username: user.username,
        online: user.online,
        status: user.status,
        statusHistory: user.statusHistory,
      };
    });
    res.status(200).send({
      type: RESPONSE_TYPE.USER,
      data: response,
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    // this will be DB error, so return 500 as an internal server error
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.USER,
      data: {},
      message: 'internal server error',
    });
  }
};

const getAdmin = async (_req, res) => {
  try {
    const filter = {username: 'esnadmin'};

    const result = await userModel.getUsers(userCollection, filter);
    const response = result.map((user) => {
      return {
        username: user.username,
        online: user.online,
        status: user.status,
        user_type: user.user_type,
        statusHistory: user.statusHistory,
      };
    });
    if (response.length === 0) {
      res.status(404).send({
        type: RESPONSE_TYPE.USER,
        data: {},
        message: 'Admin not found',
      });
    } else {
      res.status(200).send({
        type: RESPONSE_TYPE.USER,
        data: {user: response[0]},
        message: 'success',
      });
    }
  } catch (err) /* istanbul ignore next */ {
    // this will be DB error, so return 500 as an internal server error
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.USER,
      data: {},
      message: 'internal server error',
    });
  }
};

const createFirstAdminUser = async (req, res) => {
  try {
    // username & password comes from the I5 use case spec
    // https://docs.google.com/document/d/10YoJi1llAiDIGQnoFHb5-EKarz2M2N-pYOHi8bRej7w/edit?usp=sharing
    const username = 'ESNAdmin';
    const password = 'admin';

    let saltRounds = 10;
    let newUser = {
      username: username.toLowerCase(),
      password: hashSync(password, saltRounds),
      online: true,
    };
    const user = await userModel.createUser(userCollection, newUser);

    // set up admin user privilege & status
    await userModel.updateUserInfo(userCollection, [
      {_id: user._id},
      {user_type: USER_TYPE.ADMINISTRATOR, status: STATUS_CODE.OK},
    ]);

    res.status(201).send({
      type: RESPONSE_TYPE.REGISTER,
      data: {},
      message: 'admin user create successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    // MongoServerError: E11000 duplicate key error collection
    if (err.code == 11000) {
      return res.status(409).send({
        type: RESPONSE_TYPE.REGISTER,
        data: {},
        message: 'admin user already exists',
      });
    }

    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.REGISTER,
      data: {},
      message: 'internal server error',
    });
  }
};

const updateOnlineStatus = async (token, onlineStatus) => {
  const user = await jwt.getUserFromToken(token);
  // if the username has been updated, ignore send online status event the info will be covered by account-status event
  if (user) {
    await userModel.updateUserInfo(userCollection, [
      {_id: user._id},
      {online: onlineStatus},
    ]);
    GetSocketIoServerInstance().emit(SOCKET_TYPE.UPDATE_ONLINE_STATUS, {
      username: user.username,
      online: onlineStatus,
    });
  }
};

const getUserStatusHistory = async (req, res) => {
  try {
    const username = req.params.username;

    const user = await userModel.getUser(userCollection, {username: username});

    return res.status(200).send({
      type: RESPONSE_TYPE.USER,
      data: {
        statusHistory: user.statusHistory,
      },
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    // this will be DB error, so return 500 as an internal server error
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.USER,
      data: {},
      message: 'internal server error',
    });
  }
};

const updateUserInfo = async (req, res) => {
  try {
    // original username
    const name = req.params.username;
    // original user info
    const user = await userModel.getUser(userCollection, {
      username: name.toLowerCase(),
    });
    const {username, password, account_status, user_type} = req.body;
    let saltRounds = 10;
    const query = {
      username: username ? username.toLowerCase() : user.username,
      account_status: account_status ? account_status : user.account_status,
      password: password ? hashSync(password, saltRounds) : user.password,
      user_type: user_type ? user_type : user.user_type,
    };
    const newUser = await userModel.updateUserInfo(userCollection, [
      {_id: user._id},
      query,
    ]);
    GetSocketIoServerInstance().emit(SOCKET_TYPE.ACCOUNT_STATUS, {
      original_username: name.toLowerCase(),
      username: newUser.username,
      account_status: newUser.account_status,
      status: newUser.status,
    });
    res.status(200).send({
      type: RESPONSE_TYPE.USER,
      data: {},
      message: 'user updated successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    // MongoServerError: E11000 duplicate key error collection
    if (err.code == 11000) {
      return res.status(409).send({
        type: RESPONSE_TYPE.USER,
        data: {},
        message: 'username has already exist, please use another username',
      });
    }

    // this will be DB error, so return 500 as an internal server error
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.USER,
      data: {},
      message: 'internal server error',
    });
  }
};

export default {
  getUser,
  register,
  updateUserInfo,
  updateOnlineStatus,
  getUsers,
  getUserStatusHistory,
  login,
  logout,
  getAdmin,
  createFirstAdminUser,
};
