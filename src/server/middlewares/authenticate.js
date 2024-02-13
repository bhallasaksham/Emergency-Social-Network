import jwt from 'jsonwebtoken';
import {config} from '/config/config';
import {LOGIN_PATH} from '/server/util/routerConstants';
import jwtSign from '/server/util/jwtSign';

//* middlewares/authenticate.js
const authenticate = () => {
  return async function (req, res, next) {
    const token = jwtSign.getToken(req);

    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        return res.status(401).send({
          message: err.message,
        });
      }
      req.user = user;

      next();
    });
  };
};

const authView = (req, res, view) => {
  /* istanbul ignore next */
  if (req.cookies['token'] === undefined) {
    // no token, redirect to login page
    return res.redirect(LOGIN_PATH);
  }

  const token = req.cookies.token.split(' ')[1]; // trim the Bearer
  const decodedToken = jwtSign.decodeToken(token);
  if (decodedToken && decodedToken.username) {
    // auth pass, render to view page
    return view(req, res);
  } else {
    // auth fail, redirect to login page
    return res.redirect(LOGIN_PATH);
  }
};

export {authenticate, authView};
