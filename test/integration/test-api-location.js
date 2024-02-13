import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  updateUserLocation,
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

test('default location sharing preference for user is always undefined', async () => {
  const adam = await createUser();
  await supertest(server)
    .get(`/api/users/${adam.username}/preferences/location`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(200)
    .then((result) => {
      const response = JSON.parse(result.text);
      expect(response.data).toBe('Undefined');
    });
});

test('can update location sharing preference for user', async () => {
  const adam = await createUser();
  const updatedPreferenceData = {
    preference: 'Allowed',
  };
  await supertest(server)
    .put(`/api/users/${adam.username}/preferences/location`)
    .send(updatedPreferenceData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(200);
});

test('location sharing preferences can only be set to allowed or not allowed', async () => {
  const adam = await createUser();
  const incorrectUpdatedPreferenceData = {
    preference: 'random',
  };
  await supertest(server)
    .put(`/api/users/${adam.username}/preferences/location`)
    .send(incorrectUpdatedPreferenceData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(422);
});

test('can update current location for user', async () => {
  const adam = await createUser();
  const locationData = {
    latitude: '37.3031',
    longitude: '-122.2283904',
  };
  await updateUserLocation(adam, locationData);
});

test('current location cannot be updated if latitude or longitude is not given in request body', async () => {
  const adam = await createUser();
  const locationDataOnlyLatitude = {
    latitude: '37.3031',
  };
  const locationDataOnlyLongitude = {
    longitude: '-122.2283904',
  };
  await supertest(server)
    .put(`/api/users/${adam.username}/location`)
    .send(locationDataOnlyLatitude)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(422);
  await supertest(server)
    .put(`/api/users/${adam.username}/location`)
    .send(locationDataOnlyLongitude)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(422);
});

test('current location for user can be queried from the server', async () => {
  const adam = await createUser();
  const locationData = {
    latitude: '37.3031',
    longitude: '-122.2283904',
  };
  await updateUserLocation(adam, locationData);

  await supertest(server)
    .get(`/api/users/${adam.username}/location`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(200)
    .then((result) => {
      const response = JSON.parse(result.text);
      expect(response.data.coordinates.length).toBe(2);
      expect(response.data.coordinates[0]).toBe(-122.2283904);
      expect(response.data.coordinates[1]).toBe(37.3031);
    });
});
