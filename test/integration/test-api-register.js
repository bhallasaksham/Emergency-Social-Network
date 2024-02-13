import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
} from './integration-util';
import expressServer from '../../src/expressServer';

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

test('create a new user', async () => {
  // arrange
  const userData = {
    username: 'elizabeth',
    password: '12345678',
  };

  // act
  await supertest(server)
    .post('/api/users')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.user).toHaveProperty('username', userData.username);
    });
});

test('create a new user error handling -- username length less than 3', async () => {
  // arrange
  const userData = {
    username: 'ab',
    password: '12345678',
  };

  // act
  await supertest(server)
    .post('/api/users')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(422);
});

test('create a new user error handling -- username is in a blocklist', async () => {
  // arrange
  const userData = {
    username: 'access',
    password: '12345678',
  };

  // act
  await supertest(server)
    .post('/api/users')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(422)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(`"username" contains an invalid value`);
    });
});

test('create a new user error handling -- username is not provided', async () => {
  // arrange
  const userData = {
    password: '12345678',
  };

  // act
  await supertest(server)
    .post('/api/users')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(422);
});

test('create a new user error handling -- password less than 3', async () => {
  // arrange
  const userData = {
    username: 'hahahahah',
    password: '12',
  };

  // act
  await supertest(server)
    .post('/api/users')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(422);
});

test('create a new user error handling -- password not provided', async () => {
  // arrange
  const userData = {
    username: 'hahahahah',
  };

  // act
  await supertest(server)
    .post('/api/users')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(422);
});
