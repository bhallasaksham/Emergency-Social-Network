import quizModel from '/server/models/quizModel';
import {Quiz} from '/server/models/schema';
import {RESPONSE_TYPE} from '/server/util/enum';
const fs = require('fs');

const quizCollection = Quiz;

const saveQuiz = async (req, res) => {
  try {
    const {quiz_title} = req.body;
    const quiz = await quizModel.getQuiz(quizCollection, {
      quiz_title: quiz_title,
    });
    // quiz already exists
    if (quiz) {
      return res.status(409).send({
        type: RESPONSE_TYPE.QUIZ,
        data: {quiz: {}},
        message: 'quiz already exists',
      });
    }

    const query = {
      quiz_title: req.body.quiz_title,
      option1: req.body.option1,
      option2: req.body.option2,
      option3: req.body.option3,
      option4: req.body.option4,
      answer: req.body.answer,
    };
    await quizModel.saveQuiz(quizCollection, query);

    res.status(201).send({
      type: RESPONSE_TYPE.QUIZ,
      data: {
        quizzes: {
          quiz_title: query.quiz_title,
          option1: query.option1,
          option2: query.option2,
          option3: query.option3,
          option4: query.option4,
          answer: query.answer,
        },
      },
      message: 'quiz create successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.QUIZ,
      data: {},
      message: 'internal server error',
    });
  }
};

const insertQuizdata = async () => {
  const obj = JSON.parse(fs.readFileSync('quizzes.json', 'utf8'));
  for (let i = 0; i < obj.length; i++) {
    let body = obj[i];
    const query = {
      quiz_title: body.quiz_title,
      option1: body.option1,
      option2: body.option2,
      option3: body.option3,
      option4: body.option4,
      type: body.type,
      answer: body.answer,
    };
    await quizModel.saveQuiz(quizCollection, query);
  }
};

const getQuizzes = async (_req, res) => {
  try {
    const quiz = await quizModel.getQuizzes(quizCollection);
    if (quiz[0] == undefined) {
      await insertQuizdata();
    }
    const result = await quizModel.getQuizzes(quizCollection);
    const quizzes = result.map((quiz) => {
      return {
        _id: quiz._id,
        quiz_title: quiz.quiz_title,
        option1: quiz.option1,
        option2: quiz.option2,
        option3: quiz.option3,
        option4: quiz.option4,
        type: quiz.type,
        answer: quiz.answer,
      };
    });
    res.status(200).send({
      type: RESPONSE_TYPE.QUIZ,
      data: {quizzes},
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.QUIZ,
      data: {},
      message: 'internal server error',
    });
  }
};

export default {
  getQuizzes,
  saveQuiz,
};
