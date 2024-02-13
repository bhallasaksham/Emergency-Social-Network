// eslint-disable-next-line no-unused-vars
import expressServer from '../../src/expressServer'; // controller dependency needs init server
import {authenticate, authView} from '/server/middlewares/authenticate';
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

describe('Check-Auth Token', () => {
  test('given req has header that contains valid token should pass authenticate', async () => {
    // arrange
    const adam = await createUser();

    const authReq = {headers: {authorization: adam.token}};
    const mockRes = {};
    const next = jest.fn();
    const auth = await authenticate();
    await auth(authReq, mockRes, next);
    // if next() has been called, it means the token is being verified.
    expect(next).toHaveBeenCalled();
    expect(next).toBeCalledWith();
  });

  test('given req has handshake that contains valid token should pass authenticate', async () => {
    // arrange
    const adam = await createUser();

    const authReq = {handshake: {auth: {token: adam.token}}};
    const mockRes = {};
    const next = jest.fn();
    const auth = await authenticate();
    await auth(authReq, mockRes, next);
    // if next() has been called, it means the token is being verified.
    expect(next).toHaveBeenCalled();
    expect(next).toBeCalledWith();
  });

  test('illegal auth', async () => {
    const authReq = {headers: {authorization: ''}};
    const mockRes = {
      _status: null,
      _json: null,
      status: function (code) {
        this._status = code;
        return this;
      },
      send: function (json) {
        this._json = json;
        return this;
      },
    };
    const next = jest.fn();
    const auth = await authenticate();
    await auth(authReq, mockRes, next);
    expect(mockRes._status).toBe(401);
  });

  test('pass authView', async () => {
    // arrange
    const adam = await createUser();

    const mockReq = {
      cookies: {token: adam.token},
    };
    const mockRes = {
      redirect: jest.fn(),
    };
    const view = jest.fn();
    // if token pass, then display the view
    await authView(mockReq, mockRes, view);
    expect(view).toHaveBeenCalled();
  });

  test('failed authView', async () => {
    const mockReq = {
      cookies: {token: ''},
    };
    const mockRes = {
      redirect: jest.fn(),
    };
    const view = jest.fn();
    // if token is not passed, then redirect to login page
    await authView(mockReq, mockRes, view);
    expect(mockRes.redirect).toHaveBeenCalled();
  });
});
