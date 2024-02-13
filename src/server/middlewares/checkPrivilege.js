import {USER_TYPE} from '/server/util/enum';
import jwtSign from '/server/util/jwtSign';

const allowAdmin = () => {
  return async function (req, res, next) {
    const token = jwtSign.getToken(req);
    const user = await jwtSign.getUserFromToken(token);
    if (!user) {
      return res.status(404).send({
        data: {user: {}},
        message: 'user not found',
      });
    }
    if (user.user_type !== USER_TYPE.ADMINISTRATOR) {
      return res.status(403).send({
        data: {},
        message: 'reserved for admin use only',
      });
    }
    next();
  };
};

const allowCoordinator = (type) => {
  return async function (req, res, next) {
    const token = jwtSign.getToken(req);
    const user = await jwtSign.getUserFromToken(token);
    if (!user) {
      return res.status(404).send({
        data: {user: {}},
        message: 'user not found',
      });
    }
    if (
      user.user_type !== USER_TYPE.ADMINISTRATOR &&
      user.user_type !== USER_TYPE.COORDINATOR
    ) {
      return res.status(403).send({
        type: type,
        data: {},
        message: 'reserved for admin or coordinator use only',
      });
    }
    next();
  };
};

export {allowAdmin, allowCoordinator};
