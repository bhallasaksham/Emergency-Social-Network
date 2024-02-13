import supertest from 'supertest';
import expressServer from '../../src/expressServer';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
} from './integration-util';
const fs = require('fs');
const server = expressServer;
beforeAll(async () => {
  setUpServerAndDB();
});

afterEach(async () => {
  await cleanCollectionData();
});

afterAll(async () => {
  await tearDownServerAndDB();
});

test('save quizzes to database successfully', async () => {
  // arrange
  const adam = await createUser();

  // prepare quiz
  const quizData = {
    quiz_title: 'this is a test quiz',
    option1: 'option1',
    option2: 'option2',
  };

  // act
  await supertest(server)
    .post('/api/quizzes')
    .send(quizData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.quizzes).toHaveProperty(
        'quiz_title',
        quizData.quiz_title,
      );
    });
});

test('automatically insert quiz successfully', async () => {
  // arrange
  const adam = await createUser();

  // act
  await supertest(server)
    .get(`/api/quizzes`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.quizzes.length).toBe(10);
      const obj = JSON.parse(fs.readFileSync('quizzes.json', 'utf8'));
      for (let i = 0; i < obj.length; i++) {
        let body = obj[i];
        expect(res.data.quizzes[i]).toHaveProperty(
          'quiz_title',
          body.quiz_title,
        );
      }
    });
});

test('get quizzes', async () => {
  // arrange
  const adam = await createUser();

  // prepare quiz
  const quiz = await createQuiz('happy weekend', adam.token);

  // act
  await supertest(server)
    .get(`/api/quizzes`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.quizzes[0]).toHaveProperty('quiz_title', quiz.quiz_title);
    });
});

test('get top 10 quizzes only', async () => {
  // arrange
  const adam = await createUser();

  // prepare quiz
  for (let i = 0; i < 13; i++) {
    await createQuiz(`happy weekend ${i}`, adam.token);
  }

  // act
  await supertest(server)
    .get(`/api/quizzes`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.quizzes.length).toBe(10);
      for (let i = 0; i < 10; i++) {
        expect(res.data.quizzes[i]).toHaveProperty(
          'quiz_title',
          `happy weekend ${i}`,
        );
      }
    });
});

test('create quizzes with no quiz_title -- error handling', async () => {
  // arrange
  const adam = await createUser();

  // prepare
  const quizData = {
    option1: 'option1',
    option2: 'option2',
  };

  // act
  await supertest(server)
    .post('/api/quizzes')
    .send(quizData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(422);
});

test('create quizzes with only one quiz option -- error handling', async () => {
  // arrange
  const adam = await createUser();

  // prepare quiz
  const quizData = {
    quiz_title: 'happy weekend', //repeat quiz title
    option1: 'option1',
  };

  // act
  await supertest(server)
    .post('/api/quizzes')
    .send(quizData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(422);
});

test('create quizzes with a repeat quiz title -- error handling', async () => {
  // arrange
  const adam = await createUser();

  // eslint-disable-next-line no-unused-vars
  const quiz = await createQuiz('happy weekend', adam.token);

  // prepare quiz
  const quizData = {
    quiz_title: 'happy weekend', //repeat quiz title
    option1: 'option1',
    option2: 'option2',
  };

  // act
  await supertest(server)
    .post('/api/quizzes')
    .send(quizData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(409);
});

// helper fn to create a quiz
const createQuiz = async (text, token) => {
  let quiz;
  const quizData = {
    quiz_title: text,
    option1: 'option1',
    option2: 'option2',
  };

  await supertest(server)
    .post('/api/quizzes')
    .send(quizData)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      quiz = res.data.quizzes;
    });

  return quiz;
};
