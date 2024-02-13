import {isPerfMode, GetCurrentPerfUserId} from '/server/util/perfTestMode';
import {RESPONSE_TYPE} from '/server/util/enum';
import jwtSign from '/server/util/jwtSign';

const isPerfTestMode = () => {
  return async function (_req, res, next) {
    if (isPerfMode()) {
      return res.status(503).send({
        type: RESPONSE_TYPE.PERFORMANCE,
        data: {},
        message: 'system is under performance test, please try again later',
      });
    }
    next();
  };
};

// valid scenario for API operations
// 1. isPerfMode: false
// 2. isPerfMode: true + caller is the one who trigger perf test
const checkPerfTestModeWithAdminUserInfo = () => {
  return async function (req, res, next) {
    const {id} = jwtSign.decodeToken(jwtSign.getToken(req));
    if (isPerfMode() && GetCurrentPerfUserId() !== id) {
      return res.status(503).send({
        type: RESPONSE_TYPE.PERFORMANCE,
        data: {},
        message: 'system is under performance test, please try again later',
      });
    }
    next();
  };
};

export {isPerfTestMode, checkPerfTestModeWithAdminUserInfo};
