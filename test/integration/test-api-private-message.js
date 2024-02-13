import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  createChatroom,
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

test('create private message', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  await createChatroom([shangyi.username, adam.username], shangyi.token);

  const data = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
    message: 'happy weekend',
  };

  // act
  await supertest(server)
    .post('/api/messages/private')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const message = res.data.message;
      // assert
      expect(message).toHaveProperty('sender_name', data.sender_name);
      expect(message).toHaveProperty('message', data.message);
    });
});

test('create private message w/o chatroom created should return 404 not found', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  const data = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
    message: 'happy weekend',
  };

  // act
  await supertest(server)
    .post('/api/messages/private')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(404); // assert
});

test('create private message - invalid param', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  await createChatroom([shangyi.username, adam.username], shangyi.token);

  const dataWithoutMessage = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
  };

  // act
  await supertest(server)
    .post('/api/messages/private')
    .send(dataWithoutMessage)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(422); // assert

  const dataWithoutSenderName = {
    receiver_name: adam.username,
    message: 'happy weekend',
  };

  // act
  await supertest(server)
    .post('/api/messages/private')
    .send(dataWithoutSenderName)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(422); // assert

  const dataWithoutReceiver = {
    sender_name: shangyi.username,
    message: 'happy weekend',
  };

  // act
  await supertest(server)
    .post('/api/messages/private')
    .send(dataWithoutReceiver)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(422); // assert
});

test('get private message in a chatroom w/o query param', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  const chatroom = await createChatroom(
    [shangyi.username, adam.username],
    shangyi.token,
  );

  const data = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
    message: 'happy weekend',
  };
  const msgCount = 5;
  for (let i = 0; i < msgCount; i++) {
    await sendPrivateMessage(data, shangyi.token);
  }

  // act
  await supertest(server)
    .get(`/api/messages/private?chatroom_id=${chatroom.id}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(msgCount);
      for (let i = 0; i < res.data.messages.length; i++) {
        expect(res.data.messages[i].sender_name).toBe(shangyi.username);
        expect(res.data.messages[i].message).toBe('happy weekend');
      }
    });
});

test('get private message in a chatroom w/ words', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  const chatroom = await createChatroom(
    [shangyi.username, adam.username],
    shangyi.token,
  );

  // prepare private msg
  const weekendCount = 5;
  for (let i = 0; i < weekendCount; i++) {
    const data = {
      sender_name: shangyi.username,
      receiver_name: adam.username,
      message: 'happy weekend',
    };
    await sendPrivateMessage(data, adam.token);
  }
  const mondayCount = 3;
  for (let i = 0; i < mondayCount; i++) {
    const data = {
      sender_name: shangyi.username,
      receiver_name: adam.username,
      message: 'blue monday',
    };
    await sendPrivateMessage(data, adam.token);
  }

  // when user type in weekend,happy, only msg contain 'happy' and 'weekend' should show
  const words = 'weekend,happy';

  // act
  await supertest(server)
    .get(`/api/messages/private?chatroom_id=${chatroom.id}&words=${words}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(weekendCount);
      for (let i = 0; i < res.data.messages.length; i++) {
        expect(res.data.messages[i].sender_name).toBe(shangyi.username);
        expect(res.data.messages[i].message).toBe('happy weekend');
      }
    });
});

test('get private message in a chatroom w/ limit', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  const chatroom = await createChatroom(
    [shangyi.username, adam.username],
    shangyi.token,
  );

  // prepare private msg
  const msgCount = 5;
  for (let i = 0; i < msgCount; i++) {
    const data = {
      sender_name: shangyi.username,
      receiver_name: adam.username,
      message: 'happy weekend',
    };
    await sendPrivateMessage(data, adam.token);
  }

  // when user type in weekend,happy, only msg contain 'happy' and 'weekend' should show
  const limit = 2;

  // act
  await supertest(server)
    .get(`/api/messages/private?chatroom_id=${chatroom.id}&limit=${limit}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(limit);
    });
});

test('get private message in a chatroom w/ offset', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  const chatroom = await createChatroom(
    [shangyi.username, adam.username],
    shangyi.token,
  );

  // prepare 5 private msg
  const msgCount = 5;
  for (let i = 0; i < msgCount; i++) {
    const data = {
      sender_name: shangyi.username,
      receiver_name: adam.username,
      message: 'happy weekend',
    };
    await sendPrivateMessage(data, adam.token);
  }

  const offset = 3;

  // act
  await supertest(server)
    .get(`/api/messages/private?chatroom_id=${chatroom.id}&offset=${offset}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(msgCount - offset);
    });
});

test('get private messages w/ only stop word in `words` should return 200 empty array', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  const chatroom = await createChatroom(
    [shangyi.username, adam.username],
    shangyi.token,
  );

  const stopWords = 'be,a'; // all stop words are located in /util/stopWords.js

  // prepare 5 private msg
  const msgCount = 5;
  for (let i = 0; i < msgCount; i++) {
    const data = {
      sender_name: shangyi.username,
      receiver_name: adam.username,
      message: 'happy weekend',
    };
    await sendPrivateMessage(data, adam.token);
  }

  await supertest(server)
    .get(`/api/messages/private?chatroom_id=${chatroom.id}&words=${stopWords}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(0);
    });
});

test('get private message w/o chatroomID should return 422', async () => {
  // arrange
  const shangyi = await createUser();

  // act
  await supertest(server)
    .get(`/api/messages/private`)
    .set('Accept', 'application/json')
    .set('Authorization', shangyi.token)
    .expect('Content-Type', /json/)
    .expect(422); // assert
});

test('get notifications by user should return no notifications when both user are online', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();

  await createChatroom([shangyi.username, adam.username], shangyi.token);

  // 1. sent private message to online user
  const data = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
    message: 'happy weekend',
  };

  await sendPrivateMessage(data, shangyi.token);

  // act
  await supertest(server)
    .get(`/api/messages/notifications?username=${adam.username}`)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const notifications = res.data.notifications;
      // assert
      expect(notifications).toEqual([]);
    });
});

test('get notifications by user should get notifications when one user is offline', async () => {
  // arrance
  const shangyi = await createUser();
  const adam = await createUser();

  await createChatroom([shangyi.username, adam.username], shangyi.token);

  // 1. set one user offline
  const userData = {
    username: adam, // hakan offline
    password: '12345678',
  };
  await supertest(server)
    .put('/api/users/offline')
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token);

  // 2. sent private message to offline user
  const data = {
    sender_name: shangyi.username,
    receiver_name: adam.username,
    message: 'happy weekend',
  };

  await sendPrivateMessage(data, shangyi.token);

  // act
  // 3. get notification by offline username
  await supertest(server)
    .get(`/api/messages/notifications?username=${adam.username}`)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const notifications = res.data.notifications;
      // assert
      expect(notifications[0].sender_name).toBe(shangyi.username);
      expect(notifications[0].receiver_name).toBe(adam.username);
      expect(notifications[0].message).toBe(data.message);
    });

  // act
  // 4. once get notification by offline username, server should clear notifications
  await supertest(server)
    .get(`/api/messages/notifications?username=${adam.username}`)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      // assert
      const res = JSON.parse(result.text);
      const notifications = res.data.notifications;
      expect(notifications).toEqual([]);
    });
});

// helper fn to create chatroom
const sendPrivateMessage = async (data, token) => {
  await supertest(server)
    .post('/api/messages/private')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .expect(201);
};
