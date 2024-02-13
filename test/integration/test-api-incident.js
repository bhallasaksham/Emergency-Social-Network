import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  updateUserLocation,
} from './integration-util';
import expressServer from '../../src/expressServer';
import {getIncidentAnnouncement} from '/server/util/incidentReport';

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

const createAdminUserForIncidents = async () => {
  await supertest(server)
    .post('/api/users/admin')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201);
};

test('report incident without location coordinates or details is allowed', async () => {
  await createAdminUserForIncidents();
  const adam = await createUser();
  const incidentData = {
    severity: '3',
    locationName: 'San Jose',
    details: '',
  };
  await supertest(server)
    .post(`/api/incidents/${adam.username}/reports`)
    .send(incidentData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(201);
});

test('reporting incident with location data creates announcement for announcement page', async () => {
  await createAdminUserForIncidents();
  const saksham = await createUser();
  // Redwood City, CA
  const sakshamLocationData = {
    latitude: '37.3031',
    longitude: '-122.2283904',
  };
  updateUserLocation(saksham, sakshamLocationData);
  const incidentData = {
    severity: '4',
    locationCoordinates: [-122.2283904, 37.3031],
    locationName: 'Redwood City, CA',
    details:
      'There is severe damage on inner roads, can someone help with getting food here',
  };

  await supertest(server)
    .post(`/api/incidents/${saksham.username}/reports`)
    .send(incidentData)
    .set('Accept', 'application/json')
    .set('Authorization', `${saksham.token}`)
    .expect(201);

  const capitalizedUsername =
    saksham.username.charAt(0).toUpperCase() + saksham.username.slice(1);
  const announcementMessage = getIncidentAnnouncement(
    capitalizedUsername,
    incidentData,
  );

  await supertest(server)
    .get(`/api/announcements`)
    .set('Accept', 'application/json')
    .set('Authorization', `${saksham.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.announcements[0]).toHaveProperty(
        'announcement',
        announcementMessage,
      );
    });
});

test('reporting incident with location data creates notifications for users within 100 miles', async () => {
  await createAdminUserForIncidents();
  const saksham = await createUser();
  // Redwood City, CA
  const sakshamLocationData = {
    latitude: '37.3031',
    longitude: '-122.2283904',
  };
  updateUserLocation(saksham, sakshamLocationData);

  const john = await createUser();
  // Manhattan, NY
  const johnLocationData = {
    latitude: '40.7128',
    longitude: '-74.006',
  };
  updateUserLocation(john, johnLocationData);
  const adam = await createUser();
  // Mountain View, CA
  const adamLocationData = {
    latitude: '37.3861',
    longitude: '-122.0839',
  };
  updateUserLocation(adam, adamLocationData);
  const hakan = await createUser(); // No location data for this user
  const incidentData = {
    severity: '4',
    locationCoordinates: [-122.2283904, 37.3031],
    locationName: 'Redwood City, CA',
    details:
      'There is severe damage on inner roads, can someone help with getting food here',
  };
  await supertest(server)
    .post(`/api/incidents/${saksham.username}/reports`)
    .send(incidentData)
    .set('Accept', 'application/json')
    .set('Authorization', `${saksham.token}`)
    .expect(201);

  // john doesn't get notified because he is not within 100 miles of incident
  await supertest(server)
    .get(`/api/incidents/${john.username}/notifications`)
    .set('Accept', 'application/json')
    .set('Authorization', `${john.token}`)
    .expect(200)
    .then((result) => {
      const response = JSON.parse(result.text);
      expect(response.data.notifications.length).toBe(0);
    });

  // adam gets notified because he is within 100 miles of incident
  await supertest(server)
    .get(`/api/incidents/${adam.username}/notifications`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect(200)
    .then((result) => {
      const response = JSON.parse(result.text);
      expect(response.data.notifications.length).toBe(1);
    });

  // hakan does not get notified because he has not enabled sharing location with the system
  await supertest(server)
    .get(`/api/incidents/${hakan.username}/notifications`)
    .set('Accept', 'application/json')
    .set('Authorization', `${hakan.token}`)
    .expect(200)
    .then((result) => {
      const response = JSON.parse(result.text);
      expect(response.data.notifications.length).toBe(0);
    });
});
