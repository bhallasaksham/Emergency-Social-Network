import supertest from 'supertest';
import expressServer from '../../src/expressServer';
import {
  setUpServerAndDB,
  tearDownServerAndDB,
  createUser,
  cleanCollectionData,
  FakeEmailClient,
  createChatroom,
} from './integration-util';
import chatroomModel from '/server/models/chatroomModel';
import {Chatroom} from '/server/models/schema';
import emergencyContactController from '/server/controllers/emergencyContactController';
import {STATUS_CODE} from '/server/util/enum';
import mongoose from 'mongoose';

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

test('create emergency contact success w/ only required into', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  const data = {
    contact_username: shangyi.username,
  };

  // act
  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.contact).toHaveProperty('username', shangyi.username);
      expect(res.data.contact).toHaveProperty(
        'enable_send_public_message',
        false,
      );
      expect(res.data.contact).not.toHaveProperty('email_address');
    });
});

test('create emergency contact success', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  const data = {
    contact_username: shangyi.username,
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  // act
  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.contact).toHaveProperty('username', shangyi.username);
      expect(res.data.contact).toHaveProperty(
        'enable_send_public_message',
        true,
      );
      expect(res.data.contact).toHaveProperty(
        'email_address',
        'hello@gmail.com',
      );
    });
});

test('create emergency contact success when there is already chatroom exists', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  await createChatroom([shangyi.username, adam.username], shangyi.token);

  const data = {
    contact_username: shangyi.username,
  };

  // act
  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.contact).toHaveProperty('username', shangyi.username);
      expect(res.data.contact).toHaveProperty(
        'enable_send_public_message',
        false,
      );
      expect(res.data.contact).not.toHaveProperty('email_address');
    });
});

test('create emergency contact using oneself should fail with 400 bad request', async () => {
  // arrange
  const adam = await createUser();

  const data = {
    contact_username: adam.username,
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  // act
  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(400)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.message).toBe(
        "can't set oneself as emergency contact, please use another citizen as emergency contact",
      );
    });
});

test('create emergency contact twice w/ same citizen should fail w/ 409 conflict', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  await createEmergencyContact(shangyi.username, adam.token);

  const data = {
    contact_username: shangyi.username,
  };

  // act
  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(409)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe('emergency contact already exist');
    });
});

test('create emergency contact error handling - emergency contact not exist in ESN should return 404 not found', async () => {
  // arrange
  const adam = await createUser();
  const data = {
    contact_username: 'non-exist-user',
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(404)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(
        'citizen not found in social network, please use another citizen as emergency contact',
      );
    });
});

test('create emergency contact error handling - given invalid token should return 401', async () => {
  // arrange
  const data = {
    contact_username: 'shangyi',
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `invalid token`)
    .expect('Content-Type', /json/)
    .expect(401);
});

test('create emergency contact error handling - missing required field `contact_username`', async () => {
  // arrange
  const adam = await createUser();
  const data = {
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', adam.token)
    .expect('Content-Type', /json/)
    .expect(422)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(`"contact_username" is required`);
    });
});

test('get emergency contact success', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  const contact = await createEmergencyContact(shangyi.username, adam.token);

  await supertest(server)
    .get('/api/emergencies/contacts')
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.contact).toHaveProperty('username', contact.username);
      expect(res.data.contact).toHaveProperty(
        'enable_send_public_message',
        true,
      );
      expect(res.data.contact).toHaveProperty(
        'email_address',
        contact.email_address,
      );
    });
});

test('get emergency contact not found should return 404', async () => {
  // arrange
  const adam = await createUser();

  await supertest(server)
    .get('/api/emergencies/contacts')
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(404)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.message).toBe('emergency contact not found');
    });
});

test('update emergency contact success', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  await createEmergencyContact(shangyi.username, adam.token);

  const elizabeth = await createUser();
  const data = {
    contact_username: elizabeth.username,
    email_address: 'new_email@gmail.com',
    enable_send_public_message: false,
  };

  // act
  await supertest(server)
    .put('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200);

  await supertest(server)
    .get('/api/emergencies/contacts')
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.contact).toHaveProperty(
        'username',
        data.contact_username,
      );
      expect(res.data.contact).toHaveProperty(
        'enable_send_public_message',
        data.enable_send_public_message,
      );
      expect(res.data.contact).toHaveProperty(
        'email_address',
        data.email_address,
      );
    });
});

test('update emergency contact using oneself should fail with 400 bad request', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  await createEmergencyContact(shangyi.username, adam.token);

  const data = {
    contact_username: adam.username,
  };

  // act
  await supertest(server)
    .put('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(400)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.message).toBe(
        "can't set oneself as emergency contact, please use another citizen as emergency contact",
      );
    });
});

test('update emergency contact error handling - emergency contact not exist in ESN should return 404 not found', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  await createEmergencyContact(shangyi.username, adam.token);

  const data = {
    contact_username: 'non-exist-user',
  };

  await supertest(server)
    .put('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(404)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(
        'citizen not found in social network, please use another citizen as emergency contact',
      );
    });
});

test('update emergency contact error handling - missing required field `contact_username`', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  await createEmergencyContact(shangyi.username, adam.token);

  const data = {
    email_address: 'new_email@gmail.com',
    enable_send_public_message: true,
  };

  await supertest(server)
    .put('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(422)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      expect(res.message).toBe(`"contact_username" is required`);
    });
});

test('create emergency notification success w/ all notification enabled', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  const client = new FakeEmailClient();
  emergencyContactController.setEmailClient(client); // use strategy pattern to substitute fake email client

  await createEmergencyContact(shangyi.username, adam.token);

  // act
  await supertest(server)
    .post('/api/emergencies/notifications')
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.contactInfo).toHaveProperty('chatroom_id');
      expect(res.data.contactInfo).toHaveProperty('receiver', shangyi.username);
      expect(res.data.contactInfo).toHaveProperty('citizen', adam.username);
      expect(res.data.contactInfo).toHaveProperty(
        'status',
        STATUS_CODE.EMERGENCY,
      );
      // assert
      expect(res.message).toBe('notification created');
    });

  // assert client receive correct data
  const contactInfoFromFake = client.contactInfo;
  expect(contactInfoFromFake).toHaveProperty('to', 'hello@gmail.com');
  expect(contactInfoFromFake).toHaveProperty(
    'from',
    'emergencysocialnetworkf22sb1@gmail.com',
  );
  expect(contactInfoFromFake['subject']).toContain('Needs Your Help');
  expect(contactInfoFromFake['html']).toContain('<!DOCTYPE html>');

  // assert chatroom has message
  const chatroom = await chatroomModel.getChatroomByMembers(Chatroom, {
    members: [
      mongoose.Types.ObjectId(adam.id),
      mongoose.Types.ObjectId(shangyi.id),
    ],
  });

  await supertest(server)
    .get(`/api/messages/private?chatroom_id=${chatroom._id}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages[0].message).toBe(
        "It's an earthquake!! I need help!! My Location: CMU-SV Room 224",
      );
      expect(res.data.messages[0].sender_name).toBe(adam.username);
    });
});

test('create emergency notification success with public wall preference disabled', async () => {
  // arrange
  const adam = await createUser();
  const shangyi = await createUser();

  await createEmergencyContact(shangyi.username, adam.token, {
    contact_username: shangyi.username,
    enable_send_public_message: false,
  });

  // act
  await supertest(server)
    .post('/api/emergencies/notifications')
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.message).toBe('notification created');
    });

  // assert public wall has message
  await supertest(server)
    .get(`/api/messages/public`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.data.messages.length).toBe(0);
    });

  // assert chatroom has emergency message
  const chatroom = await chatroomModel.getChatroomByMembers(Chatroom, {
    members: [
      mongoose.Types.ObjectId(adam.id),
      mongoose.Types.ObjectId(shangyi.id),
    ],
  });

  await supertest(server)
    .get(`/api/messages/private?chatroom_id=${chatroom.id}`)
    .set('Accept', 'application/json')
    .set('Authorization', `${shangyi.token}`)
    .expect('Content-Type', /json/)
    .expect(200)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      // assert
      expect(res.data.messages[0].message).toBe(
        "It's an earthquake!! I need help!! My Location: CMU-SV Room 224",
      );
      expect(res.data.messages[0].sender_name).toBe(adam.username);
    });
});

// helper fn to create an emergency contact
const createEmergencyContact = async (
  contactUser,
  token,
  data = {
    contact_username: contactUser,
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  },
) => {
  let contact;

  await supertest(server)
    .post('/api/emergencies/contacts')
    .send(data)
    .set('Accept', 'application/json')
    .set('Authorization', token)
    .expect('Content-Type', /json/)
    .expect(201)
    .then(async (result) => {
      const res = JSON.parse(result.text);
      contact = res.data.contact;
    });

  return contact;
};

test('create emergency notification error handling - when there is no emergency contact exist should return 404 not found', async () => {
  // arrange
  const adam = await createUser();

  // act
  await supertest(server)
    .post('/api/emergencies/notifications')
    .set('Accept', 'application/json')
    .set('Authorization', `${adam.token}`)
    .expect('Content-Type', /json/)
    .expect(404)
    .then(async (result) => {
      const res = JSON.parse(result.text);

      // assert
      expect(res.message).toBe('emergency contact not found');
    });
});
