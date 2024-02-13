import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  createAdminUser,
  updateUserAccountStatus,
} from './integration-util';
import {ACCOUNT_STATUS} from '/server/util/enum';
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

test('create marker', async () => {
  // arrange
  const adam = await createUser();

  const data = {
    username: adam.username,
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };
  // act
  await supertest(server)
    .post('/api/map')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const marker = res.data.marker;
      // assert
      expect(marker).toHaveProperty('username', adam.username);
      expect(marker).toHaveProperty('longitude', '-122.071962');
      expect(marker).toHaveProperty('latitude', '37.376307');
      expect(marker).toHaveProperty('status', 'help');
    });
});

test('update marker', async () => {
  // arrange
  const adam = await createUser();

  const data = {
    username: adam.username,
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };
  // act
  await supertest(server)
    .post('/api/map')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(201);

  const updateData = {
    username: adam.username,
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'ok',
  };

  // act
  await supertest(server)
    .post('/api/map')
    .send(updateData)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const marker = res.data.marker;
      // assert
      expect(marker).toHaveProperty('username', adam.username);
      expect(marker).toHaveProperty('longitude', '-122.071962');
      expect(marker).toHaveProperty('latitude', '37.376307');
      expect(marker).toHaveProperty('status', 'ok');
    });
});

test('get markers', async () => {
  // arrange
  const adam = await createUser();

  const data = {
    username: adam.username,
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };

  // act
  await supertest(server)
    .post('/api/map')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(201);

  // act
  await supertest(server)
    .get(`/api/map`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const markerList = res.data.markers;
      // assert
      expect(markerList.length).toBe(1);
      expect(markerList[0]).toHaveProperty('username', adam.username);
      expect(markerList[0]).toHaveProperty('longitude', '-122.071962');
      expect(markerList[0]).toHaveProperty('latitude', '37.376307');
      expect(markerList[0]).toHaveProperty('status', 'help');
    });
});

test('get markers should filter out inactive user', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();
  const admin = await createAdminUser();

  const data = {
    username: adam.username,
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };

  // act
  await supertest(server)
    .post('/api/map')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(201);

  await updateUserAccountStatus(admin, adam, {
    account_status: ACCOUNT_STATUS.INACTIVE,
  });

  // act
  await supertest(server)
    .get(`/api/map`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const markerList = res.data.markers;
      // assert
      expect(markerList.length).toBe(0);
    });
});
