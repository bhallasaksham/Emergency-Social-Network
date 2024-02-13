import express from 'express';
import userController from '/server/controllers/userController';
import shareStatusController from 'server/controllers/shareStatusController';
import locationController from 'server/controllers/locationController';
import {allowAdmin} from '/server/middlewares/checkPrivilege';
import {validateBody, validateParam} from '/server/middlewares/validator';
import paramValidation from '/server/util/paramValidation';
import {authenticate} from '/server/middlewares/authenticate';
import {isPerfTestMode} from '/server/middlewares/isPerfTestMode';

const router = express.Router();

router
  .route('/')
  .post(
    validateBody(paramValidation.user),
    isPerfTestMode(),
    userController.register,
  );

router
  .route('/admin')
  .post(isPerfTestMode(), userController.createFirstAdminUser);

router
  .route('/online')
  .put(
    validateBody(paramValidation.user),
    isPerfTestMode(),
    userController.login,
  );

router
  .route('/offline')
  .put(authenticate(), isPerfTestMode(), userController.logout);

router
  .route('/')
  .get(authenticate(), isPerfTestMode(), userController.getUsers);

router.route('/admin').get(isPerfTestMode(), userController.getAdmin);

router
  .route('/:username')
  .put(
    authenticate(),
    allowAdmin(),
    validateBody(paramValidation.updateUserInfo),
    isPerfTestMode(),
    userController.updateUserInfo,
  );

router
  .route('/:username/status-histories')
  .get(authenticate(), isPerfTestMode(), userController.getUserStatusHistory);

router
  .route('/:username/status/:statusCode')
  .patch(
    authenticate(),
    validateParam(paramValidation.status),
    isPerfTestMode(),
    shareStatusController.shareStatus,
  );

router
  .route('/:username/preferences/location')
  .get(
    authenticate(),
    isPerfTestMode(),
    locationController.getUserLocationPreference,
  );

router
  .route('/:username/preferences/location')
  .put(
    validateBody(paramValidation.locationPreference),
    authenticate(),
    isPerfTestMode(),
    locationController.updateUserLocationPreference,
  );

router
  .route('/:username/location')
  .put(
    validateBody(paramValidation.location),
    authenticate(),
    isPerfTestMode(),
    locationController.updateUserLocation,
  );

router
  .route('/:username/location')
  .get(authenticate(), isPerfTestMode(), locationController.getUserLocation);

export default router;
