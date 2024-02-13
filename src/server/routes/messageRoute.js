import express from 'express';
import chatPubliclyController from '/server/controllers/chatPubliclyController';
import chatPrivatelyController from '/server/controllers/chatPrivatelyController';
import paramValidation from '/server/util/paramValidation';
import {validateBody, validateQuery} from '/server/middlewares/validator';
import {authenticate} from '/server/middlewares/authenticate';
import {
  isPerfTestMode,
  checkPerfTestModeWithAdminUserInfo,
} from '/server/middlewares/isPerfTestMode';
import {filterStopWords} from '/server/middlewares/filterStopWords';
import {RESPONSE_TYPE} from '/server/util/enum';

const router = express.Router();

router
  .route('/public')
  .post(
    authenticate(),
    checkPerfTestModeWithAdminUserInfo(),
    validateBody(paramValidation.message),
    chatPubliclyController.saveMessage,
  );

router
  .route('/public')
  .get(
    authenticate(),
    checkPerfTestModeWithAdminUserInfo(),
    filterStopWords(RESPONSE_TYPE.MESSAGE),
    chatPubliclyController.getMessages,
  );

router
  .route('/private/chatrooms')
  .post(
    authenticate(),
    isPerfTestMode(),
    validateBody(paramValidation.chatroom),
    chatPrivatelyController.createChatroom,
  );

router
  .route('/private/chatrooms') // GET /api/messages/private?username
  .get(
    authenticate(),
    isPerfTestMode(),
    validateQuery(paramValidation.getChatroomsByUser),
    chatPrivatelyController.getChatroomsByUser,
  );

router
  .route('/private/chatrooms/members') // GET /api/messages/private/chatrooms/members?sender=''&receiver=''
  .get(
    authenticate(),
    isPerfTestMode(),
    chatPrivatelyController.getChatroomByMembers,
  );

router
  .route('/private') // GET /api/messages/private?chatroom_id
  .get(
    authenticate(),
    isPerfTestMode(),
    validateQuery(paramValidation.getPrivateMessage),
    filterStopWords(RESPONSE_TYPE.CHAT),
    chatPrivatelyController.getPrivateMessage,
  );

router
  .route('/private')
  .post(
    authenticate(),
    isPerfTestMode(),
    validateBody(paramValidation.privateMessage),
    chatPrivatelyController.savePrivateMessage,
  );

router
  .route('/notifications') // GET /api/messages/notifications?username
  .get(
    authenticate(),
    isPerfTestMode(),
    filterStopWords(),
    chatPrivatelyController.getNotificationsByUser,
  );

export default router;
