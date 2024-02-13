/* istanbul ignore file */

import express from 'express';
import {config} from '/config';
import {
  USER_PATH,
  MESSAGE_PATH,
  PERFORMANCE_PATH,
  ANNOUNCEMENT_PATH,
  EMERGENCY_PATH,
  QUIZ_PATH,
  MAP_API_PATH,
  DONATION_PATH,
  INCIDENT_PATH,
} from '/server/util/routerConstants';

// Router
import userRoute from './userRoute';
import messageRoute from './messageRoute';
import performanceRoute from './performanceRoute';
import announcementRoute from './announcementRoute';
import emergencyRoute from './emergencyRoute';
import quizRoute from './quizRoute';
import mapRoute from './mapRoute';
import donationRoute from './donationRoute';
import incidentRoute from './incidentRoute';

const router = express.Router();

/* GET localhost:[port]/api page. */
router.get('/', (req, res) => {
  res.send(`Api Path: localhost:${config.port}/api`);
});

router.use(USER_PATH, userRoute);
router.use(MESSAGE_PATH, messageRoute);
router.use(PERFORMANCE_PATH, performanceRoute);
router.use(ANNOUNCEMENT_PATH, announcementRoute);
router.use(EMERGENCY_PATH, emergencyRoute);
router.use(QUIZ_PATH, quizRoute);
router.use(MAP_API_PATH, mapRoute);
router.use(DONATION_PATH, donationRoute);
router.use(INCIDENT_PATH, incidentRoute);

export default router;
