import express from 'express';
import {authenticate} from '/server/middlewares/authenticate';
import {isPerfTestMode} from '/server/middlewares/isPerfTestMode';
import donationController from '/server/controllers/donationController';
import {validateBody} from '/server/middlewares/validator';
import paramValidation from '/server/util/paramValidation';

const router = express.Router();

router
  .route('/')
  .post(
    authenticate(),
    isPerfTestMode(),
    validateBody(paramValidation.donation),
    donationController.saveDonation,
  );

router
  .route('/')
  .get(authenticate(), isPerfTestMode(), donationController.getDonations);

router
  .route('/:username/:resource/:quantity/:status')
  .put(
    authenticate(),
    isPerfTestMode(),
    donationController.updateDonationStatus,
  );
export default router;
