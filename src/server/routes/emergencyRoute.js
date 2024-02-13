import express from 'express';
import emergencyContactController from '/server/controllers/emergencyContactController';
import {validateBody} from '/server/middlewares/validator';
import paramValidation from '/server/util/paramValidation';
import {authenticate} from '/server/middlewares/authenticate';
import {isPerfTestMode} from '/server/middlewares/isPerfTestMode';

const router = express.Router();

router
  .route('/contacts')
  .put(
    authenticate(),
    isPerfTestMode(),
    validateBody(paramValidation.emergencyContact),
    emergencyContactController.updateEmergencyContact,
  );

router
  .route('/contacts')
  .post(
    authenticate(),
    isPerfTestMode(),
    validateBody(paramValidation.emergencyContact),
    emergencyContactController.saveEmergencyContact,
  );

router
  .route('/contacts')
  .get(
    authenticate(),
    isPerfTestMode(),
    emergencyContactController.getEmergencyContact,
  );

router
  .route('/notifications')
  .post(
    authenticate(),
    isPerfTestMode(),
    emergencyContactController.sendNotificationToEmergencyContact,
  );

export default router;
