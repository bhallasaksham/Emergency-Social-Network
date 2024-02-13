import supertest from 'supertest';
import expressServer from '../../src/expressServer';
import {
  createUser,
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createAdminUser,
  createCoordinatorUser,
} from './integration-util';

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

// all the performance related testing will run in this case because the server has state and can't run individually
test('admin is able to start & stop performance test', async () => {
  // arrange
  const admin = await createAdminUser();
  const anotherAdmin = await createAdminUser();
  const citizen = await createUser();

  // act
  // 1. start perf test, the server will change to test collection
  await supertest(server)
    .put(`/api/performance/start`)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(200); //assert

  // act
  // 2. test isPerfTestMode middleware should block operation w/ 503
  await supertest(server)
    .get('/api/announcements')
    .set('Accept', 'application/json')
    .set('Authorization', `${citizen.token}`)
    .expect('Content-Type', /json/)
    .expect(503); // assert

  // act
  // 2. test checkPerfTestModeWithAdminUserInfo should allow user who trigger perf test send request
  await supertest(server)
    .post('/api/messages/public')
    .send({
      message: 'random-msg',
    })
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(201); // assert

  // act
  // 3. test checkPerfTestModeWithAdminUserInfo should block user who trigger perf test send request
  //    when user who doesn't start perf test but want to stop, should receive 503
  await supertest(server)
    .put(`/api/performance/stop`)
    .set('Accept', 'application/json')
    .set('Authorization', `${anotherAdmin.token}`)
    .expect('Content-Type', /json/)
    .expect(503); //assert

  // act
  // 4. stop perf test, the server will switch back to original collection
  await supertest(server)
    .put(`/api/performance/stop`)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(200); //assert
});

test('given it is not perf mode, call stop performance test API should return 400', async () => {
  // arrange
  const admin = await createAdminUser();

  // act
  await supertest(server)
    .put(`/api/performance/stop`)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(400)
    .then(async (err) => {
      const res = JSON.parse(err.text);
      expect(res.message).toBe('system is not under performance test');
    });
});

test('coordinator cannot start performance test', async () => {
  // arrange
  const coordinator = await createCoordinatorUser();

  // act
  await supertest(server)
    .put(`/api/performance/start`)
    .set('Accept', 'application/json')
    .set('Authorization', `${coordinator.token}`)
    .expect('Content-Type', /json/)
    .expect(403)
    .then(async (err) => {
      const res = JSON.parse(err.text);
      expect(res.message).toBe('reserved for admin use only');
    });
});
