import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  createAdminUser,
  updateUserAccountStatus,
  createChatroom,
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

test('create private chatroom', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  const data = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
  };
  // act
  await supertest(server)
    .post('/api/messages/private/chatrooms')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data).toHaveProperty('members', [
        shangyi.username,
        adam.username,
      ]);
    });
});

test('create private chatroom conflict should return 409', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  await createChatroom([shangyi.username, adam.username], shangyi.token);

  const data = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
  };
  // act
  await supertest(server)
    .post('/api/messages/private/chatrooms')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(409); // assert
});

test('create private chatroom invalid param should return 422', async () => {
  // arrange
  const shangyi = await createUser();

  const dataWithoutReceiver = {
    sender_name: shangyi.username,
  };

  // act
  await supertest(server)
    .post('/api/messages/private/chatrooms')
    .send(dataWithoutReceiver)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(422); // assert

  const dataWithoutSender = {
    receiver_name: shangyi.username,
  };

  // act
  await supertest(server)
    .post('/api/messages/private/chatrooms')
    .send(dataWithoutSender)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(422); // assert
});

test('get privare chatrooms by user', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();
  const aishwarya = await createUser();

  // create two chatroom for shangyi -> should return
  await createChatroom([shangyi.username, adam.username], shangyi.token);
  await createChatroom([shangyi.username, aishwarya.username], shangyi.token);

  // create one chatroom for adam & aishwarya -> should not return
  await createChatroom([adam.username, aishwarya.username], adam.token);

  await supertest(server)
    .get(`/api/messages/private/chatrooms?username=${shangyi.username}`)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const chatrooms = res.data.chatrooms;
      // assert
      expect(chatrooms.length).toBe(2);

      // only shangyi's chatroom should return
      for (let i = 0; i < chatrooms.length; i++) {
        expect(chatrooms[i].members).toContain(shangyi.username);
      }
    });
});

test('get privare chatrooms should filter out inactive user', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();
  const aishwarya = await createUser();
  const admin = await createAdminUser();

  // create two chatroom for shangyi
  // update adam to inactive
  // -> expect only chatroom of shangyi & aishwarya should return
  await createChatroom([shangyi.username, adam.username], shangyi.token);
  await createChatroom([shangyi.username, aishwarya.username], shangyi.token);
  await updateUserAccountStatus(admin, adam, {
    account_status: ACCOUNT_STATUS.INACTIVE,
  });

  await supertest(server)
    .get(`/api/messages/private/chatrooms?username=${shangyi.username}`)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const chatrooms = res.data.chatrooms;
      // assert
      expect(chatrooms.length).toBe(1);

      // only shangyi & aishwarya's chatroom should return
      expect(chatrooms[0].members).toContain(shangyi.username);
      expect(chatrooms[0].members).toContain(aishwarya.username);
    });
});

test('get privare chatrooms missing username should return 422', async () => {
  // arrange
  const shangyi = await createUser();

  await supertest(server)
    .get(`/api/messages/private/chatrooms`)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(422);
});
test('get chatroom for two given users', async () => {
  // arrange
  const aishwarya = await createUser();
  const testUser = await createUser();

  const expectedChatroom = await createChatroom(
    [aishwarya.username, testUser.username],
    aishwarya.token,
  );

  // act
  await supertest(server)
    .get(
      `/api//messages/private/chatrooms/members/?sender=${aishwarya.username}&receiver=${testUser.username}`,
    )
    .set('Accept', 'application/json')
    .set('Authorization', aishwarya.token)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const chatroom = res.data._id;
      const members = res.data.members;
      // assert
      expect(chatroom).toBe(expectedChatroom.id);
      expect(members[0]).toBe(aishwarya.username);
      expect(members[1]).toBe(testUser.username);
    });
});

// align donation I4 API spec
test('get chatroom for two given users not found should return 200', async () => {
  // arrange
  const aishwarya = await createUser();
  const testUser = await createUser();

  // act
  await supertest(server)
    .get(
      `/api//messages/private/chatrooms/members/?sender=${aishwarya.username}&receiver=${testUser.username}`,
    )
    .set('Accept', 'application/json')
    .set('Authorization', aishwarya.token)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const chatroom = res.data;
      // assert
      expect(chatroom).toBe(undefined);
    });
});
