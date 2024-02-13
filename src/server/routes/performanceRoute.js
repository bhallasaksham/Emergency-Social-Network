import express from 'express';
import measurePerformanceController from '/server/controllers/measurePerformanceController';
import {authenticate} from '/server/middlewares/authenticate';
import {allowAdmin} from '/server/middlewares/checkPrivilege';
import {
  isPerfTestMode,
  checkPerfTestModeWithAdminUserInfo,
} from '/server/middlewares/isPerfTestMode';

const router = express.Router();

router
  .route('/start')
  .put(
    authenticate(),
    allowAdmin(),
    isPerfTestMode(),
    measurePerformanceController.startPerformanceTest,
  );

router
  .route('/stop')
  .put(
    authenticate(),
    allowAdmin(),
    checkPerfTestModeWithAdminUserInfo(),
    measurePerformanceController.stopPerformanceTest,
  );

export default router;
