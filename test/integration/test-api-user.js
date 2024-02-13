import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  createAdminUser,
  createInactiveUser,
  updateUserStatus,
} from './integration-util';
import expressServer from '../../src/expressServer';
import {STATUS_CODE, USER_TYPE, ACCOUNT_STATUS} from '/server/util/enum';
import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';

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

test('registered citizen login should receive 200 with correct info', async () => {
  // arrange
  const adam = await createUser();
  const userData = {
    username: adam.username,
    password: '12345678',
  };
  // act
  await supertest(server)
    .put('/api/users/online')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.user).toHaveProperty('username', adam.username);
      expect(res.data.user.token).toContain('Bearer');
      expect(res.data.user).toHaveProperty('user_type', 'citizen');
    });
});

test('admin login should receive 200 with user_type administrator', async () => {
  // arrange
  const admin = await createAdminUser();
  const userData = {
    username: admin.username,
    password: '12345678',
  };
  // act
  await supertest(server)
    .put('/api/users/online')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.user).toHaveProperty('username', admin.username);
      expect(res.data.user.token).toContain('Bearer');
      expect(res.data.user).toHaveProperty('user_type', 'administrator');
    });
});

test('non-registered user try login should recieve 404 user not found', async () => {
  // arrange
  const nonExistingUser = {
    username: 'saksham',
    password: '12345678',
  };
  // act
  await supertest(server)
    .put('/api/users/online')
    .send(nonExistingUser)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(404);
});

test('user try to login w/ wrong password should recieve 401 auth error', async () => {
  // arrange
  const adam = await createUser();
  const userData = {
    username: adam.username,
    password: 'wrong-password',
  };
  // act
  await supertest(server)
    .put('/api/users/online')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(401);
});

test('get users w/ status words', async () => {
  // arrange
  const adam = await createUser();
  // prepare status
  const elizabeth = await createUser();
  await updateUserStatus(elizabeth, 'help');
  const aishwarya = await createUser();
  await updateUserStatus(aishwarya, 'help');
  const saksham = await createUser();
  await updateUserStatus(saksham, 'emergency');
  const shangyi = await createUser();
  await updateUserStatus(shangyi, 'ok');
  // act
  await supertest(server)
    .get(`/api/users?status=help`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.length).toBe(2);
      // all users status should be help
      for (let i = 0; i < res.data.length; i++) {
        expect(res.data[i]).toHaveProperty('status', STATUS_CODE['HELP']);
      }
    });
});

test('get users w/ username query partial match', async () => {
  // arrange
  const adam = await createUser();
  const someUserData = {
    username: 'saksham',
    password: '12345678',
  };

  const anotherUserData = {
    username: 'sak',
    password: '12345678',
  };
  await supertest(server)
    .post('/api/users')
    .send(someUserData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201);

  await supertest(server)
    .post('/api/users')
    .send(anotherUserData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201);

  const query = 'sak';

  // act
  await supertest(server)
    .get(`/api/users?username=${query}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.length).toBe(2);
      expect(res.data[0].username.includes(query));
      expect(res.data[1].username.includes(query));
    });
});

test('get users w/ status history', async () => {
  // arrange
  const adam = await createUser();
  const saksham = await createUser();
  await updateUserStatus(saksham, 'emergency');
  await updateUserStatus(saksham, 'help');

  // act
  await supertest(server)
    .get(`/api/users/${saksham.username}/status-histories`)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.statusHistory.length).toBe(3);
      expect(res.data.statusHistory[0]).toBe('Undefined');
      expect(res.data.statusHistory[1]).toBe('Emergency');
      expect(res.data.statusHistory[2]).toBe('Help');
    });
});

test('get only active users', async () => {
  // arrange
  const aishwarya = await createUser();
  const testUser2 = await createInactiveUser();

  // act
  await supertest(server)
    .get(`/api/users?account_status=active`)
    .set('Accept', 'application/json')
    .set('Authorization', `${aishwarya.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.length).toBe(1);
      expect(res.data[0].username).toBe(aishwarya.username);
      expect(res.data[0].username).not.toBe(testUser2.username);
    });
});

test('get all users for admin', async () => {
  // arrange
  const admin = await createUser();
  const aishwarya = await createInactiveUser();

  // act
  await supertest(server)
    .get(`/api/users`)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.length).toBe(2);
      expect(res.data[0].username).toBe(admin.username);
      expect(res.data[1].username).toBe(aishwarya.username);
    });
});

test('registered user should be allowed to logout', async () => {
  // arrange
  const adam = await createUser();
  const userData = {
    username: adam.username,
    password: '12345678',
  };
  // act
  await supertest(server)
    .put('/api/users/offline')
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200); // assert
});

test('logged in user should be allowed to logout', async () => {
  // arrange
  const adam = await createUser();
  const userData = {
    username: adam.username,
    password: '12345678',
  };

  await supertest(server)
    .put('/api/users/online')
    .send(userData)
    .set('Accept', 'application/json')
    .expect(200);

  // act
  await supertest(server)
    .put('/api/users/offline')
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200); // assert
});

test('update user info with all attributes', async () => {
  // arrange
  const admin = await createAdminUser();

  const adam = await createUser();
  const userData = {
    username: 'Elizabeth',
    password: '12345678',
    account_status: ACCOUNT_STATUS.INACTIVE,
    user_type: 'administrator',
  };

  // act
  await supertest(server)
    .put(`/api/users/${adam.username}`)
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(200);

  const dbUser = await userModel.getUser(User, {
    username: userData.username.toLowerCase(),
  });
  expect(dbUser.username).toBe(userData.username.toLowerCase());
  expect(dbUser.account_status).toBe(userData.account_status);
  expect(dbUser.user_type).toBe(userData.user_type);
});

test('update user info with a username already existed before -- return 409', async () => {
  // arrange
  const admin = await createAdminUser();

  const adam = await createUser();
  const elizabeth = await createUser();
  const userData = {
    username: elizabeth.username,
    password: '12345678',
    account_status: ACCOUNT_STATUS.INACTIVE,
    user_type: 'administrator',
  };

  // act
  await supertest(server)
    .put(`/api/users/${adam.username}`)
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(409);
});

test('update user info with an username does not follow spec -- return 422', async () => {
  // arrange
  const admin = await createAdminUser();

  const adam = await createUser();
  const userData = {
    username: 'el',
  };

  // act
  await supertest(server)
    .put(`/api/users/${adam.username}`)
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(422)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(
        '"username" length must be at least 3 characters long',
      );
    });
});

test('update user info with a password  does not follow spec -- return 422', async () => {
  // arrange
  const admin = await createAdminUser();

  const adam = await createUser();
  const userData = {
    password: '123',
  };

  // act
  await supertest(server)
    .put(`/api/users/${adam.username}`)
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(422)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(
        '"password" length must be at least 4 characters long',
      );
    });
});

test('an unregistered user tries to login should recieve 401 auth error', async () => {
  const userData = {
    username: 'saksham',
    password: '12345678',
  };
  await supertest(server)
    .put('/api/users/offline')
    .send(userData)
    .set('Accept', 'application/json')
    .expect(401); // assert
});

test('create an admin user success should have proper privilege and status', async () => {
  // arrange

  // act
  await supertest(server)
    .post('/api/users/admin')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201);

  const dbUser = await userModel.getUser(User, {
    username: 'esnadmin',
  });

  expect(dbUser.username).toBe('esnadmin');
  expect(dbUser.status).toBe(STATUS_CODE.OK);
  expect(dbUser.user_type).toBe(USER_TYPE.ADMINISTRATOR);
});

test('create an admin user that already exists should fail with 409 conflict', async () => {
  // arrange
  await userModel.createUser(User, {
    username: 'esnadmin',
    password: 'admin',
    online: true,
    status: STATUS_CODE.OK,
    user_type: USER_TYPE.ADMINISTRATOR,
  });

  // act
  await supertest(server)
    .post('/api/users/admin')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(409)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe('admin user already exists');
    });
});

test('get admin', async () => {
  // arrange
  await userModel.createUser(User, {
    username: 'esnadmin',
    password: 'admin',
    online: true,
    status: STATUS_CODE.OK,
    user_type: USER_TYPE.ADMINISTRATOR,
  });

  await supertest(server)
    .get('/api/users/admin')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.data.user.username).toBe('esnadmin');
      expect(res.data.user.user_type).toBe(USER_TYPE.ADMINISTRATOR);
    });
});

test('get admin when admin does not exist', async () => {
  await supertest(server)
    .get('/api/users/admin')
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(404)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe('Admin not found');
    });
});

test('inactive user try to login should receive 401 error', async () => {
  // arrange
  const adam = await createInactiveUser();
  const userData = {
    username: adam.username,
    password: '12345678',
  };

  await supertest(server)
    .put('/api/users/online')
    .send(userData)
    .set('Accept', 'application/json')
    .expect(401)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(
        'your account is inactive, please contact admin for help',
      );
    });
});
