import express from 'express';
import mapController from '/server/controllers/mapController';
import {authenticate} from '/server/middlewares/authenticate';
import {validateBody} from '/server/middlewares/validator';
import paramValidation from '/server/util/paramValidation';

const router = express.Router();

router
  .route('/')
  .post(
    authenticate(),
    validateBody(paramValidation.createMarker),
    mapController.createMarker,
  );
router.route('/').get(authenticate(), mapController.getMarkers);

export default router;
