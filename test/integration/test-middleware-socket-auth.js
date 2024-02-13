// eslint-disable-next-line no-unused-vars
import expressServer from '../../src/expressServer'; // controller dependency needs init server
import {SocketAuth} from '/server/middlewares/socketAuth';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  createUser,
  cleanCollectionData,
} from './integration-util';

beforeAll(async () => {
  setUpServerAndDB();
});

afterEach(async () => {
  await cleanCollectionData();
});

afterAll(async () => {
  await tearDownServerAndDB();
});

describe('Check Socket-Auth Token', () => {
  test('legal auth', async () => {
    // arrange
    const adam = await createUser();

    const socket = {
      handshake: {
        auth: {
          token: adam.token,
        },
      },
    };

    const next = jest.fn();

    await SocketAuth(socket, next);
    // if next() has been called, it means the token is being verified.
    expect(next).toHaveBeenCalled();
    expect(next).toBeCalledWith();
  });

  test('illegal auth', async () => {
    const socket = {
      handshake: {
        auth: {
          token: '',
        },
      },
    };

    const next = jest.fn();
    await SocketAuth(socket, next);
    expect(next).toHaveBeenCalled();
    expect(next).toBeCalledWith(new Error('authentication error'));
  });
});
