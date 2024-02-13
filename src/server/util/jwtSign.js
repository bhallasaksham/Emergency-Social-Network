import jwt from 'jsonwebtoken';
import {config} from '/config/config';
import userController from '/server/controllers/userController';

const signToken = (userId, username) => {
  const payload = {
    id: userId,
    username: username,
  };
  return jwt.sign(payload, config.jwtSecret, {expiresIn: '1d'});
};

const getToken = (req) => {
  let token;
  if (req.handshake) {
    token = req.handshake.auth.token && req.handshake.auth.token.split(' ')[1]; // trim the Bearer
    return token;
  } else if (req.headers['authorization']) {
    const authHeader = req.headers['authorization'];
    token = authHeader && authHeader.split(' ')[1]; // trim the Bearer
    return token;
  } else {
    console.log('could not get token');
    return token;
  }
};

const decodeToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return;
  }
};

const getUserFromToken = async (token) => {
  // decode token & get username
  const decodedToken = decodeToken(token);
  const user = userController.getUser(decodedToken.username);
  return user;
};

export default {
  signToken,
  decodeToken,
  getToken,
  getUserFromToken,
};
