import express from 'express';
import postAnnouncementController from '/server/controllers/postAnnouncementController';
import {allowCoordinator} from '/server/middlewares/checkPrivilege';
import {validateBody} from '/server/middlewares/validator';
import paramValidation from '/server/util/paramValidation';
import {authenticate} from '/server/middlewares/authenticate';
import {isPerfTestMode} from '/server/middlewares/isPerfTestMode';
import {filterStopWords} from '/server/middlewares/filterStopWords';
import {RESPONSE_TYPE} from '/server/util/enum';

const router = express.Router();

router
  .route('/')
  .post(
    authenticate(),
    allowCoordinator(),
    isPerfTestMode(),
    validateBody(paramValidation.announcement),
    postAnnouncementController.saveAnnouncement,
  );

router
  .route('/')
  .get(
    authenticate(),
    isPerfTestMode(),
    filterStopWords(RESPONSE_TYPE.ANNOUNCEMENT),
    postAnnouncementController.getAnnouncements,
  );

export default router;
