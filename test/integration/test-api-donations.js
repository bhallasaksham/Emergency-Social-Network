import supertest from 'supertest';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  cleanCollectionData,
  createUser,
  updateUserAccountStatus,
  createAdminUser,
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

test('create new donation entry', async () => {
  // arrange
  const testUser = await createUser();

  const data = {
    resource: 'Tents',
    quantity: 10,
  };
  // act
  await supertest(server)
    .post('/api/donations')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', testUser.token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      const resource = res.data.donation;
      // assert
      expect(resource).toHaveProperty('resource', data.resource);
      expect(resource).toHaveProperty('quantity', data.quantity);
    });
});

test('get all donation entries', async () => {
  // arrange
  const testUser = await createUser();

  const data = {
    resource: 'Tents',
    quantity: 10,
  };

  const donationCount = 5;
  for (let i = 0; i < donationCount; i++) {
    await saveDonationEntry(data, testUser.token);
  }

  // act
  await supertest(server)
    .get(`/api/donations`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.donations.length).toBe(donationCount);
      for (let i = 0; i < res.data.donations.length; i++) {
        expect(res.data.donations[i].username).toBe(testUser.username);
        expect(res.data.donations[i].resource).toBe(data.resource);
        expect(res.data.donations[i].quantity).toBe(data.quantity);
      }
    });
});

test('get donation entries should filter out inactive user', async () => {
  // arrange
  const aishwarya = await createUser();
  const shangyi = await createUser();
  const admin = await createAdminUser();

  await saveDonationEntry(
    {
      resource: 'Tents',
      quantity: 10,
    },
    shangyi.token,
  );

  await updateUserAccountStatus(admin, shangyi, {
    account_status: ACCOUNT_STATUS.INACTIVE,
  });

  // act
  await supertest(server)
    .get(`/api/donations`)
    .set('Accept', 'application/json')
    .set('Authorization', `${aishwarya.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.donations.length).toBe(0);
    });
});

test('get all donation entries for specified user and resource', async () => {
  // arrange
  const testUser = await createUser();
  const aishwarya = await createUser();

  const resource = {
    resource: 'Blankets',
    quantity: 5,
  };

  await saveDonationEntry(resource, testUser.token);
  await saveDonationEntry(resource, aishwarya.token);

  const data = {
    resource: 'Tents',
    quantity: 10,
  };

  const donationCount = 5;
  for (let i = 0; i < donationCount; i++) {
    await saveDonationEntry(data, testUser.token);
  }

  // act
  await supertest(server)
    .get(
      `/api/donations?username=${testUser.username}&resource=${data.resource}`,
    )
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.donations.length).toBe(donationCount);
      for (let i = 0; i < res.data.donations.length; i++) {
        expect(res.data.donations[i].username).toBe(testUser.username);
        expect(res.data.donations[i].resource).toBe(data.resource);
        expect(res.data.donations[i].quantity).toBe(data.quantity);
      }
    });
});

test('get all donation entries excluding one user', async () => {
  // arrange
  const testUser = await createUser();
  const aishwarya = await createUser();

  const resource = {
    resource: 'Blankets',
    quantity: 5,
  };

  await saveDonationEntry(resource, aishwarya.token);

  const data = {
    resource: 'Tents',
    quantity: 10,
  };

  const donationCount = 5;
  for (let i = 0; i < donationCount; i++) {
    await saveDonationEntry(data, testUser.token);
  }

  // act
  await supertest(server)
    .get(`/api/donations?exclude=${aishwarya.username}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.donations.length).toBe(donationCount);
      for (let i = 0; i < res.data.donations.length; i++) {
        expect(res.data.donations[i].username).toBe(testUser.username);
        expect(res.data.donations[i].resource).toBe(data.resource);
        expect(res.data.donations[i].quantity).toBe(data.quantity);
      }
    });
});

test('get all donation entries for one user', async () => {
  // arrange
  const testUser = await createUser();
  const aishwarya = await createUser();

  const resource = {
    resource: 'Blankets',
    quantity: 5,
  };

  await saveDonationEntry(resource, aishwarya.token);

  const data = {
    resource: 'Tents',
    quantity: 10,
  };

  const donationCount = 5;
  for (let i = 0; i < donationCount; i++) {
    await saveDonationEntry(data, testUser.token);
  }

  // act
  await supertest(server)
    .get(`/api/donations?username=${testUser.username}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.donations.length).toBe(donationCount);
      for (let i = 0; i < res.data.donations.length; i++) {
        expect(res.data.donations[i].username).toBe(testUser.username);
        expect(res.data.donations[i].resource).toBe(data.resource);
        expect(res.data.donations[i].quantity).toBe(data.quantity);
      }
    });
});

test('update donation entry for one resource posted by a user', async () => {
  // arrange
  const testUser = await createUser();

  const data = {
    resource: 'Tents',
    quantity: 10,
  };

  const dataToUpdate = {
    resource: 'Blankets',
    quantity: 2,
  };

  const donationCount = 5;
  for (let i = 0; i < donationCount; i++) {
    await saveDonationEntry(data, testUser.token);
  }

  await saveDonationEntry(dataToUpdate, testUser.token);

  // act
  await supertest(server)
    .put(
      `/api/donations/${testUser.username}/${dataToUpdate.resource}/${
        dataToUpdate.quantity
      }/${'reserved'}`,
    )
    .set('Accept', 'application/json')
    .set('Authorization', `${testUser.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert

      expect(res.data.donation.username).toBe(testUser.username);
      expect(res.data.donation.resource).toBe(dataToUpdate.resource);
      expect(res.data.donation.status).toBe('reserved');
    });
});

// helper function to save donations
const saveDonationEntry = async (data, token) => {
  await supertest(server)
    .post('/api/donations')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .expect(201);
};
