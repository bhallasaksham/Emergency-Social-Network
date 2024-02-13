import jwt from 'jsonwebtoken';
import {config} from '/config';

async function SocketAuth(socket, next) {
  const token =
    socket.handshake.auth.token && socket.handshake.auth.token.split(' ')[1]; // trim the Bearer

  jwt.verify(token, config.jwtSecret, (err) => {
    if (err) {
      console.log('auth fail');
      return next(new Error('authentication error'));
    }
    console.log('auth success');
    next();
  });
}

export {SocketAuth};
