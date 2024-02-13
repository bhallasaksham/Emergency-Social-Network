import emergencyContactModel from '/server/models/emergencyContactModel';
import {EmergencyContact} from '/server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

test('Can save emergency contact to DB', () => {
  const query = {
    citizen_id: 'citizen_id',
    contact_user_id: 'contact_id',
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  return emergencyContactModel
    .createEmergencyContact(EmergencyContact, query)
    .then((contact) => {
      expect(contact.citizen_id).toBe(query.citizen_id);
      expect(contact.contact_user_id).toBe(query.contact_user_id);
      expect(contact.email_address).toBe(query.email_address);
      expect(contact.enable_send_public_message).toBe(true);
    });
});

test('Can get emergency contact by userId from DB', async () => {
  const query = {
    citizen_id: 'citizen_id',
    contact_user_id: 'contact_id',
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  await emergencyContactModel.createEmergencyContact(EmergencyContact, query);

  const filter = {
    userId: query.citizen_id,
  };

  const dbContact = await emergencyContactModel.getEmergencyContact(
    EmergencyContact,
    filter,
  );

  expect(dbContact.citizen_id).toBe(query.citizen_id);
  expect(dbContact.contact_user_id).toBe(query.contact_user_id);
  expect(dbContact.email_address).toBe(query.email_address);
  expect(dbContact.enable_send_public_message).toBe(true);
});

test('Can update contact details by userId in DB', async () => {
  const query = {
    citizen_id: 'citizen_id',
    contact_user_id: 'contact_id',
    email_address: 'hello@gmail.com',
    enable_send_public_message: true,
  };

  await emergencyContactModel.createEmergencyContact(EmergencyContact, query);

  const filter = {
    userId: query.citizen_id,
  };

  const updateQuery = {
    citizen_id: 'citizen_id',
    contact_user_id: 'new_contact_id',
    enable_send_public_message: false,
    email_address: 'helloworld@gmail.com',
  };

  await emergencyContactModel.updateEmergencyContact(EmergencyContact, [
    filter,
    updateQuery,
  ]);

  const dbContact = await emergencyContactModel.getEmergencyContact(
    EmergencyContact,
    filter,
  );

  expect(dbContact.citizen_id).toBe(updateQuery.citizen_id);
  expect(dbContact.contact_user_id).toBe(updateQuery.contact_user_id);
  expect(dbContact.email_address).toBe(updateQuery.email_address);
  expect(dbContact.enable_send_public_message).toBe(false);
});
