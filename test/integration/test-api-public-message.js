import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  createAdminUser,
  updateUserAccountStatus,
} from './integration-util';
import expressServer from '../../src/expressServer';
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

test('create public message', async () => {
  // arrange
  const testUser = await createUser();

  const data = {
    message: 'This is a test message.',
  };

  // act
  await supertest(server)
    .post('/api/messages/public')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', testUser.token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const message = res.data.messages;
      // assert
      expect(message).toHaveProperty('message', data.message);
    });
});

test('create public message with invalid param', async () => {
  // arrange
  const testUser = await createUser();

  const data = {};

  // act
  await supertest(server)
    .post('/api/messages/public')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', testUser.token)
    .expect('Content-Type', /json/)
    .expect(422); // assert
});

test('get all public messages', async () => {
  // arrange
  const testUser = await createUser();
  const msg = 'This is a test message.';
  const data = {
    message: msg,
  };

  const msgCount = 5;
  for (let i = 0; i < msgCount; i++) {
    await sendPublicMessage(data, testUser.token);
  }

  // act
  await supertest(server)
    .get(`/api/messages/public`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.messages.length).toBe(msgCount);
      for (let i = 0; i < res.data.messages.length; i++) {
        expect(res.data.messages[i].sender_name).toBe(testUser.username);
        expect(res.data.messages[i].message).toBe(msg);
      }
    });
});

test('get public messages should filter out inactive user', async () => {
  // arrange
  const shangyi = await createUser();
  const adam = await createUser();
  const admin = await createAdminUser();

  const shangyiMsgCnt = 2;
  for (let i = 0; i < shangyiMsgCnt; i++) {
    await sendPublicMessage(
      {
        message: 'hi adam',
      },
      shangyi.token,
    );
  }

  const adamMsgCnt = 1;
  for (let i = 0; i < adamMsgCnt; i++) {
    await sendPublicMessage(
      {
        message: 'hi shangyi',
      },
      adam.token,
    );
  }

  await updateUserAccountStatus(admin, adam, {
    account_status: ACCOUNT_STATUS.INACTIVE,
  });

  // act
  await supertest(server)
    .get(`/api/messages/public`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.messages.length).toBe(shangyiMsgCnt);
      for (let i = 0; i < res.data.messages.length; i++) {
        expect(res.data.messages[i].sender_name).toBe(shangyi.username);
        expect(res.data.messages[i].message).toBe('hi adam');
      }
    });
});

test('get public messages with searched words', async () => {
  // arrange
  const testUser = await createUser();

  const data1 = {
    message: 'This is a test message.',
  };
  const data2 = {
    message: 'Another message for test',
  };

  for (let i = 0; i < 5; i++) {
    await sendPublicMessage(data1, testUser.token);
    await sendPublicMessage(data2, testUser.token);
  }

  //only messages contain 'test' and 'another' should show
  let words = 'test,another';

  // act
  await supertest(server)
    .get(`/api/messages/public?words=${words}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(5);
      for (let i = 0; i < res.data.messages.length; i++) {
        expect(res.data.messages[i].sender_name).toBe(testUser.username);
        expect(res.data.messages[i].message).toBe('Another message for test');
      }
    });
});

test('get public messages with no results for searched words', async () => {
  // arrange
  const testUser = await createUser();

  const data1 = {
    message: 'This is a test message.',
  };
  const data2 = {
    message: 'Another message for test',
  };

  for (let i = 0; i < 5; i++) {
    await sendPublicMessage(data1, testUser.token);
    await sendPublicMessage(data2, testUser.token);
  }

  // no messages have the keyword very - so result should be empty
  let words = 'test,another,very';

  // act
  await supertest(server)
    .get(`/api/messages/public?words=${words}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(0);
    });
});

test('get public messages with a limit on search results', async () => {
  // arrange
  const testUser = await createUser();

  for (let i = 0; i < 5; i++) {
    const data = {
      message: 'This is a test message',
    };
    await sendPublicMessage(data, testUser.token);
  }

  // only two message should be returned
  const limit = 2;

  // act
  await supertest(server)
    .get(`/api/messages/public?limit=${limit}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(limit);
    });
});

test('get public message with an offset', async () => {
  // arrange
  const testUser = await createUser();

  const msgCount = 5;
  for (let i = 0; i < msgCount; i++) {
    const data = {
      message: 'This is a test message.',
    };
    await sendPublicMessage(data, testUser.token);
  }

  const offset = 3;

  // act
  await supertest(server)
    .get(`/api/messages/public?offset=${offset}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(msgCount - offset);
    });
});

test('get public messages w/ only stop word in `words` should return 200 empty array', async () => {
  // arrange
  const aishwarya = await createUser();

  const stopWords = 'be,a'; // all stop words are located in /util/stopWords.js

  // prepare 5 public msg
  const msgCount = 5;
  for (let i = 0; i < msgCount; i++) {
    const data = {
      message: 'happy wednesday',
    };
    await sendPublicMessage(data, aishwarya.token);
  }

  await supertest(server)
    .get(`/api/messages/public?words=${stopWords}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${aishwarya.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages.length).toBe(0);
    });
});

// helper fn to create chatroom
const sendPublicMessage = async (data, token) => {
  await supertest(server)
    .post('/api/messages/public')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .expect(201);
};
