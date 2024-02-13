import {STATUS_CODE} from '/server/util/enum';
import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

test('Can save user crendentials to DB', () => {
  const time = Math.floor(new Date().getTime() / 1000); // timestamp, ex: 1665810250
  const user = {
    username: 'testUser',
    password: 'FSEIteration3',
    online: true,
    status: STATUS_CODE.OK,
    timestamp: time,
  };

  return userModel.createUser(User, user).then((userCreated) => {
    expect(userCreated.username).toBe('testUser');
    expect(userCreated.password).toBe('FSEIteration3');
    expect(userCreated.online).toBe(true);
    expect(userCreated.status).toBe(STATUS_CODE.OK);
    expect(userCreated.timestamp).toBe(time.toString());
  });
});

test('Can get user details from DB', async () => {
  const time = Math.floor(new Date().getTime() / 1000); // timestamp, ex: 1665810250
  const user = {
    username: 'FSEUser',
    password: 'FSEIteration3',
    online: true,
    status: STATUS_CODE.OK,
    timestamp: time,
  };

  await userModel.createUser(User, user);

  const dbUser = await userModel.getUser(User, {
    username: 'FSEUser',
  });

  expect(dbUser.username).toBe('FSEUser');
  expect(dbUser.password).toBe('FSEIteration3');
  expect(dbUser.online).toBe(true);
  expect(dbUser.status).toBe(STATUS_CODE.OK);
  expect(dbUser.timestamp).toBe(time.toString());
});

test('Can update user details in DB', async () => {
  const time = Math.floor(new Date().getTime() / 1000); // timestamp, ex: 1665810250
  const user = {
    username: 'StatusUpdateUser',
    password: 'FSEIteration3',
    online: true,
    status: STATUS_CODE.OK,
    timestamp: time,
  };

  await userModel.createUser(User, user);

  const newTimeStamp = Math.floor(new Date().getTime() / 1000);
  await userModel.updateUserInfo(User, [
    {
      username: 'StatusUpdateUser',
    },
    {
      status: STATUS_CODE.HELP,
      timestamp: newTimeStamp,
    },
  ]);

  const dbUser = await userModel.getUser(User, {
    username: 'StatusUpdateUser',
  });

  expect(dbUser.username).toBe('StatusUpdateUser');
  expect(dbUser.password).toBe('FSEIteration3');
  expect(dbUser.online).toBe(true);
  expect(dbUser.status).toBe(STATUS_CODE.HELP);
  expect(dbUser.timestamp).toBe(newTimeStamp.toString());
});

test('Can get inactive users in DB', async () => {
  const time = Math.floor(new Date().getTime() / 1000); // timestamp, ex: 1665810250
  const activeUser = {
    username: 'ActiveUser',
    password: 'FSEIteration3',
    account_status: 'active',
    online: true,
    status: STATUS_CODE.OK,
    timestamp: time,
  };

  await userModel.createUser(User, activeUser);
  for (let i = 0; i < 2; i++) {
    const inActiveUser = {
      username: `inActiveUser${i}`,
      password: 'FSEIteration3',
      account_status: 'inactive',
      online: true,
      status: STATUS_CODE.OK,
      timestamp: time,
    };
    await userModel.createUser(User, inActiveUser);
  }

  const dbUser = await userModel.getInactiveUsers(User);
  expect(dbUser.length).toBe(2);
  for (let i = 0; i < 2; i++) {
    expect(dbUser[i].username).toBe(`inActiveUser${i}`);
    expect(dbUser[i].account_status).toBe(`inactive`);
  }
});
