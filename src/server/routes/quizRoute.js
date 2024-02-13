import express from 'express';
import quizController from '/server/controllers/quizController';
import {authenticate} from '/server/middlewares/authenticate';
import {isPerfTestMode} from '/server/middlewares/isPerfTestMode';
import {validateBody} from '/server/middlewares/validator';
import paramValidation from '/server/util/paramValidation';

const router = express.Router();

router
  .route('/')
  .post(
    authenticate(),
    isPerfTestMode(),
    validateBody(paramValidation.quiz),
    quizController.saveQuiz,
  );

router
  .route('/')
  .get(authenticate(), isPerfTestMode(), quizController.getQuizzes);

export default router;
