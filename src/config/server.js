/* istanbul ignore file */

import express from '/server/middlewares/express';
import {authView} from '/server/middlewares/authenticate';
import routes from '/server/routes';
import {
  login,
  welcome,
  main,
  publicWall,
  shareStatus,
  chatroom,
  privateMessage,
  measurePerformance,
  measurePerformanceReport,
  postAnnouncement,
  emergencyContact,
  selfAssessment,
  selfAssessmentResult,
  selfAssessmentQuiz,
  map,
  donateResources,
  findDonations,
  reportIncident,
  userProfile,
} from '/server/views';
import {
  API_PATH,
  LOGIN_PATH,
  WELCOME_PATH,
  MAIN_PATH,
  PUBLIC_WALL_PATH,
  SHARE_STATUS_PATH,
  CHATROOM_PATH,
  PRIVATE_MESSAGE_PATH,
  MEASURE_PERFORMANCE_PATH,
  MEASURE_PERFORMANCE_REPORT_PATH,
  POST_ANNOUNCEMENT_PATH,
  EMERGENCY_CONTACT_PATH,
  SELF_ASSESSMENT_PATH,
  SELF_ASSESSMENT_RESULT_PATH,
  SELF_ASSESSMENT_QUIZ_PATH,
  MAP_PATH,
  DONATE_RESOURCES_PATH,
  FIND_DONATIONS_PATH,
  REPORT_INCIDENT_PATH,
  USER_PROFILE,
} from '/server/util/routerConstants';

const app = express;
// Home Page
app.get('/', (req, res) => {
  res.redirect(MAIN_PATH);
});

// API Path
app.use(API_PATH, routes);

// Client Path
app.get(LOGIN_PATH, login);

app.get(WELCOME_PATH, (req, res) => {
  authView(req, res, welcome);
});

app.get(PUBLIC_WALL_PATH, (req, res) => {
  authView(req, res, publicWall);
});

app.get(MAIN_PATH, (req, res) => {
  authView(req, res, main);
});

app.get(SHARE_STATUS_PATH, (req, res) => {
  authView(req, res, shareStatus);
});

app.get(CHATROOM_PATH, (req, res) => {
  authView(req, res, chatroom);
});

app.get(`${PRIVATE_MESSAGE_PATH}/:chatroomId`, (req, res) => {
  authView(req, res, privateMessage);
});

app.get(MEASURE_PERFORMANCE_PATH, (req, res) => {
  authView(req, res, measurePerformance);
});

app.get(MEASURE_PERFORMANCE_REPORT_PATH, (req, res) => {
  authView(req, res, measurePerformanceReport);
});

app.get(POST_ANNOUNCEMENT_PATH, (req, res) => {
  authView(req, res, postAnnouncement);
});

app.get(EMERGENCY_CONTACT_PATH, (req, res) => {
  authView(req, res, emergencyContact);
});

app.get(SELF_ASSESSMENT_PATH, (req, res) => {
  authView(req, res, selfAssessment);
});

app.get(SELF_ASSESSMENT_RESULT_PATH, (req, res) => {
  authView(req, res, selfAssessmentResult);
});

app.get(SELF_ASSESSMENT_QUIZ_PATH, (req, res) => {
  authView(req, res, selfAssessmentQuiz);
});

app.get(MAP_PATH, (req, res) => {
  authView(req, res, map);
});

app.get(DONATE_RESOURCES_PATH, (req, res) => {
  authView(req, res, donateResources);
});

app.get(FIND_DONATIONS_PATH, (req, res) => {
  authView(req, res, findDonations);
});

app.get(REPORT_INCIDENT_PATH, (req, res) => {
  authView(req, res, reportIncident);
});

app.get(USER_PROFILE, (req, res) => {
  authView(req, res, userProfile);
});

export {app};
