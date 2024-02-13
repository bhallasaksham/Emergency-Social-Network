import supertest from 'supertest';
import expressServer from '../../src/expressServer';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  createUser,
  cleanCollectionData,
  createAdminUser,
  updateUserAccountStatus,
  createCoordinatorUser,
} from './integration-util';
import {ACCOUNT_STATUS} from '/server/util/enum';

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

test('admin can create announcement', async () => {
  // arrange
  const admin = await createAdminUser();

  const data = {
    announcement: 'happy weekend',
  };

  // act
  await supertest(server)
    .post('/api/announcements')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.announcements).toHaveProperty(
        'sender_name',
        admin.username,
      );
      expect(res.data.announcements).toHaveProperty(
        'announcement',
        data.announcement,
      );
    });
});

test('coordinator can create announcement', async () => {
  // arrange
  const coordinator = await createCoordinatorUser();

  const data = {
    announcement: 'happy weekend',
  };

  // act
  await supertest(server)
    .post('/api/announcements')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${coordinator.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.announcements).toHaveProperty(
        'sender_name',
        coordinator.username,
      );
      expect(res.data.announcements).toHaveProperty(
        'announcement',
        data.announcement,
      );
    });
});

test('citizen cannot create announcement', async () => {
  // arrange
  const adam = await createUser();

  const data = {
    announcement: 'happy weekend',
  };

  // act
  await supertest(server)
    .post('/api/announcements')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(403); // Forbidden
});

test('get announcements w/o query param', async () => {
  // arrange
  const adam = await createUser();
  const admin = await createAdminUser();

  // prepare announcement
  const announcement = await createAnnouncement('happy weekend', admin.token);

  // act
  await supertest(server)
    .get(`/api/announcements`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // asssert
      expect(res.data.announcements[0]).toHaveProperty(
        'sender_name',
        announcement.sender_name,
      );
      expect(res.data.announcements[0]).toHaveProperty(
        'announcement',
        announcement.announcement,
      );
    });
});

test('get announcements should filter out inactive user', async () => {
  // arrange
  const shangyi = await createUser();
  const admin = await createAdminUser();
  const adminAdam = await createAdminUser();

  // prepare announcement
  await createAnnouncement('happy weekend', adminAdam.token);

  await updateUserAccountStatus(admin, adminAdam, {
    account_status: ACCOUNT_STATUS.INACTIVE,
  });

  // act
  await supertest(server)
    .get(`/api/announcements`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // asssert
      expect(res.data.announcements.length).toBe(0);
    });
});

test('get announcements w/ words', async () => {
  // arrange
  const adam = await createUser();
  const admin = await createAdminUser();

  // prepare announcement
  const weekendCount = 5;
  for (let i = 0; i < weekendCount; i++) {
    await createAnnouncement('happy weekend', admin.token);
  }
  const mondayCount = 3;
  for (let i = 0; i < mondayCount; i++) {
    await createAnnouncement('blue monday', admin.token);
  }

  // when user type in weekend,ha, only announcements contain 'ha' and 'weekend' should show
  const words = 'weekend,ha';

  // act
  await supertest(server)
    .get(`/api/announcements?words=${words}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.announcements.length).toBe(weekendCount);

      // all announcement should contain all words
      for (let i = 0; i < res.data.announcements.length; i++) {
        expect(res.data.announcements[i].announcement).toContain('ha');
        expect(res.data.announcements[i].announcement).toContain('weekend');
        expect(res.data.announcements[i]).toHaveProperty(
          'sender_name',
          admin.username,
        );
      }
    });
});

test('get announcements w/ limit', async () => {
  // arrange
  const adam = await createUser();
  const admin = await createAdminUser();

  // prepare 10 announcements
  const announcementCount = 10;
  for (let i = 0; i < announcementCount; i++) {
    await createAnnouncement('happy weekend', admin.token);
  }

  const limit = 3;

  // act
  await supertest(server)
    .get(`/api/announcements?limit=${limit}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.announcements.length).toBe(limit);
    });
});

test('get announcements w/ offset', async () => {
  // arrange
  const adam = await createUser();
  const admin = await createAdminUser();

  // prepare 5 announcements
  const announcementCount = 5;
  for (let i = 0; i < announcementCount; i++) {
    await createAnnouncement('happy weekend', admin.token);
  }

  const offset = 3;

  await supertest(server)
    .get(`/api/announcements?offset=${offset}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.announcements.length).toBe(announcementCount - offset);
    });
});

test('get announcements w/ only stop word in `words` should return 200 empty array', async () => {
  // arrange
  const adam = await createUser();
  const admin = await createAdminUser();
  const stopWords = 'be,a'; // all stop words are located in /util/stopWords.js

  // prepare 5 announcements
  const announcementCount = 5;
  for (let i = 0; i < announcementCount; i++) {
    await createAnnouncement('happy weekend', admin.token);
  }

  await supertest(server)
    .get(`/api/announcements?words=${stopWords}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.announcements.length).toBe(0);
    });
});

test('create announcement error handling - invalid token', async () => {
  const data = {
    announcement: 'happy weekend',
  };
  await supertest(server)
    .post('/api/announcements')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `invalid token`)
    .expect('Content-Type', /json/)
    .expect(401);
});

test('create announcement error handling - User Not Found', async () => {
  const notExistUserToken =
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjYzNjhhNzJkMTdhY2U2NzQyNjVmMzg5MiIsInVzZXJuYW1lIjoibm90LWV4aXN0LXVzZXIiLCJpYXQiOjE2Njc4MDI5MjV9.bz4HY9RRduyzZGcMLVZdjjqcD4tLF6w8r1fZCprw3GE';
  const data = {
    announcement: 'happy weekend',
  };
  await supertest(server)
    .post('/api/announcements')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `Bearer ${notExistUserToken}`)
    .expect('Content-Type', /json/)
    .expect(404);
});

test('create announcement error handling - Invalid Param', async () => {
  // arrange
  const admin = await createAdminUser();
  const data = {};
  await supertest(server)
    .post('/api/announcements')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', admin.token)
    .expect('Content-Type', /json/)
    .expect(422);
});

// helper fn to create an announcement
const createAnnouncement = async (text, token) => {
  let announcement;
  const data = {
    announcement: text,
  };

  await supertest(server)
    .post('/api/announcements')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      announcement = res.data.announcements;
    });

  return announcement;
};
