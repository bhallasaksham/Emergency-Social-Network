import quizModel from '/server/models/quizModel';
import {Quiz} from '/server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

test('Can save a quiz to DB', async () => {
  // arrange
  const quiz = {
    quiz_title: 'testing quiz',
    option1: 'option1',
    option2: 'option2',
    answer: ['1'],
  };
  // act
  const dbQuiz = await quizModel.saveQuiz(Quiz, quiz);
  // assert
  expect(dbQuiz.quiz_title).toBe('testing quiz');
  expect(dbQuiz.answer).toEqual(['1']);
});

test('Can get the quizz from DB', async () => {
  // arrange
  const quiz = {
    quiz_title: 'testing quiz',
    option1: 'option1',
    option2: 'option2',
    answer: ['1'],
  };

  await quizModel.saveQuiz(Quiz, quiz);

  // act
  const dbQuiz = await quizModel.getQuizzes(Quiz);

  // assert
  expect(dbQuiz).toEqual(
    expect.arrayContaining([expect.objectContaining(quiz)]),
  );
});
