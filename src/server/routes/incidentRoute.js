import express from 'express';
import incidentController from 'server/controllers/incidentController';
import {validateBody} from '/server/middlewares/validator';
import paramValidation from '/server/util/paramValidation';
import {authenticate} from '/server/middlewares/authenticate';
import {isPerfTestMode} from '/server/middlewares/isPerfTestMode';

const router = express.Router();
router
  .route('/:username/reports')
  .post(
    validateBody(paramValidation.incident),
    authenticate(),
    isPerfTestMode(),
    incidentController.processIncidentReport,
  );

router
  .route('/:username/notifications')
  .get(
    authenticate(),
    isPerfTestMode(),
    incidentController.getIncidentNotificationsByUser,
  );

export default router;
