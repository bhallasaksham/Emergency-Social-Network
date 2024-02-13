import supertest from 'supertest';
import expressServer from '../../src/expressServer';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  createUser,
  cleanCollectionData,
  updateUserStatus,
} from './integration-util';
import {STATUS_CODE} from '/server/util/enum';

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

test('given a user with undefined status, update user status to help, the user status should be help in the database', async () => {
  // arrange
  const adam = await createUser();
  // prepare status
  const statusCode = 'help';

  // act
  await supertest(server)
    .patch(`/api/users/${adam.username}/status/${statusCode}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.user).toHaveProperty(
        'status',
        STATUS_CODE[statusCode.toUpperCase()],
      );
    });
});

test('get users w/ status words', async () => {
  // arrange
  const adam = await createUser();
  // prepare status
  const elizabeth = await createUser();
  updateUserStatus(elizabeth, 'help');
  const aishwarya = await createUser();
  updateUserStatus(aishwarya, 'help');
  const saksham = await createUser();
  updateUserStatus(saksham, 'emergency');
  const shangyi = await createUser();
  updateUserStatus(shangyi, 'ok');
  // act
  await supertest(server)
    .get(`/api/users?status=help`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      //assert
      expect(res.data.length).toBe(2);
      // all users status should be help
      for (let i = 0; i < res.data.length; i++) {
        expect(res.data[i]).toHaveProperty('status', STATUS_CODE['HELP']);
      }
    });
});

test('update status error handling - invalid status code', async () => {
  // arrange
  const adam = await createUser();
  // prepare status
  const statusCode = 'helpme';
  await supertest(server)
    .patch(`/api/users/${adam.username}/status/${statusCode}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(422);
});

test('update status error handling - invalid token', async () => {
  // arrange
  const adam = await createUser();
  // prepare status
  const statusCode = 'help';
  await supertest(server)
    .patch(`/api/users/${adam.username}/status/${statusCode}`)
    .set('Accept', 'application/json')
    .set('Authorization', `invalid token`)
    .expect('Content-Type', /json/)
    .expect(401);
});
