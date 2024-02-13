import mongoose from 'mongoose';
import supertest from 'supertest';
import {v4 as uuidv4} from 'uuid';
import expressServer from '../../src/expressServer';
import {
  GetSocketIoServerInstance,
  OnConnectHandler,
} from '../../src/socketServer';
import {SocketAuth} from '/server/middlewares/socketAuth';
import {config} from '/config/config';
import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';
import {ACCOUNT_STATUS, USER_TYPE} from '/server/util/enum';

const server = expressServer;

const setUpServerAndDB = () => {
  mongoose.connect(
    /* istanbul ignore next */
    config.env == 'circleci' ? config.mongodbci : config.mongodb,
    {
      dbName: 'test-fse',
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
  );
  // init websocket server
  const io = GetSocketIoServerInstance();
  io.use(SocketAuth);
  io.on('connection', OnConnectHandler);
};

const tearDownServerAndDB = async () => {
  await cleanCollectionData();
  await mongoose.connection.close();
  await expressServer.close();
};

const cleanCollectionData = async () => {
  const collections = await mongoose.connection.db.collections();
  for (let collection of collections) {
    await collection.deleteMany({});
  }
};

// create fake user with random username so each test case can run independently
const createUser = async () => {
  let user;
  const userData = {
    username: uuidv4(),
    password: '12345678',
  };

  await supertest(server)
    .post('/api/users')
    .send(userData)
    .set('Accept', 'application/json')
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      user = res.data.user;
    });

  return user;
};

// update user status with given user and status code
const updateUserStatus = async (user, status) => {
  await supertest(server)
    .patch(`/api/users/${user.username}/status/${status}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${user.token}`)
    .expect('Content-Type', /json/)
    .expect(200);
};

// assert email client receive correct info
class FakeEmailClient {
  constructor() {}

  send = (contactInfo) => {
    this.data = contactInfo;
  };

  get contactInfo() {
    return this.data;
  }
}

const updateUserLocation = async (user, location) => {
  await supertest(server)
    .put(`/api/users/${user.username}/location`)
    .send(location)
    .set('Accept', 'application/json')
    .set('Authorization', `${user.token}`)
    .expect(200);
};

const createAdminUser = async () => {
  const admin = await createUser();
  await userModel.updateUserInfo(User, [
    {
      username: admin.username,
    },
    {user_type: USER_TYPE.ADMINISTRATOR},
  ]);
  return admin;
};

const createCoordinatorUser = async () => {
  const coordinator = await createUser();
  await userModel.updateUserInfo(User, [
    {
      username: coordinator.username,
    },
    {user_type: USER_TYPE.COORDINATOR},
  ]);
  return coordinator;
};

const createInactiveUser = async () => {
  const user = await createUser();

  // prepare inactive user
  await userModel.updateUserInfo(User, [
    {
      username: user.username,
    },
    {account_status: ACCOUNT_STATUS.INACTIVE},
  ]);
  return user;
};

const updateUserAccountStatus = async (admin, targetUser, userData) => {
  // act
  await supertest(server)
    .put(`/api/users/${targetUser.username}`)
    .send(userData)
    .set('Accept', 'application/json')
    .set('Authorization', `${admin.token}`)
    .expect('Content-Type', /json/)
    .expect(200);
};

// helper fn to create chatroom
const createChatroom = async (members, token) => {
  let chatroom;
  const data = {
    sender_name: members[0],
    receiver_name: members[1],
  };
  await supertest(server)
    .post('/api/messages/private/chatrooms')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      chatroom = res.data;
    });
  return chatroom;
};

export {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  updateUserStatus,
  FakeEmailClient,
  updateUserLocation,
  createAdminUser,
  createInactiveUser,
  createChatroom,
  updateUserAccountStatus,
  createCoordinatorUser,
};
