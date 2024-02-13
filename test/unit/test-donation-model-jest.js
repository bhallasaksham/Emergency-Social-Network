import {RESOURCE_STATUS} from '/server/util/enum';
import donationModel from '/server/models/donationModel';
import {Donation} from 'server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

// Promise way to write ut
test('Can save a new donation entry to DB', () => {
  // arrange
  const donation = {
    user_id: 'aishwaryaID',
    resource: 'Tents',
    quantity: 5,
    status: RESOURCE_STATUS.AVAILABLE,
  };

  // act
  return donationModel
    .createDonationEntry(Donation, donation)
    .then((donationEntry) => {
      // assert
      expect(donationEntry.user_id).toBe('aishwaryaID');
      expect(donationEntry.resource).toBe('Tents');
      expect(donationEntry.quantity).toBe(5);
      expect(donationEntry.status).toBe(RESOURCE_STATUS.AVAILABLE);
    });
});

// async/ await way to write ut
test('Can get donation entries from DB', async () => {
  // arrange
  const donation = {
    user_id: 'aishwaryaID',
    resource: 'Tents',
    quantity: 5,
    status: RESOURCE_STATUS.AVAILABLE,
  };
  await donationModel.createDonationEntry(Donation, donation);

  // act
  const fetchedDonationList = await donationModel.getDonationResources(
    Donation,
  );

  // assert
  expect(fetchedDonationList[0].user_id).toBe('aishwaryaID');
  expect(fetchedDonationList[0].resource).toBe('Tents');
  expect(fetchedDonationList[0].quantity).toBe(5);
  expect(fetchedDonationList[0].status).toBe(RESOURCE_STATUS.AVAILABLE);
});

test('Can update status of donation entries in DB', async () => {
  // arrange
  const donation = {
    user_id: 'aishwaryaID',
    resource: 'Tents',
    quantity: 5,
    status: RESOURCE_STATUS.AVAILABLE,
  };
  await donationModel.createDonationEntry(Donation, donation);

  // act
  const fetchedDonationList = await donationModel.getDonationResources(
    Donation,
  );

  // assert
  expect(fetchedDonationList[0].user_id).toBe('aishwaryaID');
  expect(fetchedDonationList[0].resource).toBe('Tents');
  expect(fetchedDonationList[0].quantity).toBe(5);
  expect(fetchedDonationList[0].status).toBe(RESOURCE_STATUS.AVAILABLE);

  const filter = {user_id: 'aishwaryaID', resource: 'Tents'};

  await donationModel.updateDonation(Donation, [
    filter,
    {status: RESOURCE_STATUS.RESERVED},
  ]);

  const updatedDonationList = await donationModel.getDonationResources(
    Donation,
  );
  // assert
  expect(updatedDonationList[0].user_id).toBe('aishwaryaID');
  expect(updatedDonationList[0].resource).toBe('Tents');
  expect(updatedDonationList[0].quantity).toBe(5);
  expect(updatedDonationList[0].status).toBe(RESOURCE_STATUS.RESERVED);
});

test('Can delete donation entry from DB', async () => {
  // arrange
  const donation = {
    user_id: 'aishwaryaID',
    resource: 'Tents',
    quantity: 5,
    status: RESOURCE_STATUS.AVAILABLE,
  };
  await donationModel.createDonationEntry(Donation, donation);

  // act
  const fetchedDonationList = await donationModel.getDonationResources(
    Donation,
  );

  // assert
  expect(fetchedDonationList[0].user_id).toBe('aishwaryaID');
  expect(fetchedDonationList[0].resource).toBe('Tents');
  expect(fetchedDonationList[0].quantity).toBe(5);
  expect(fetchedDonationList[0].status).toBe(RESOURCE_STATUS.AVAILABLE);

  const filter = {user_id: 'aishwaryaID', resource: 'Tents'};

  await donationModel.deleteDonationEntry(Donation, filter);

  const deletedDonationList = await donationModel.getDonationResources(
    Donation,
  );

  // assert
  expect(deletedDonationList.length).toBe(0);
});
