import announcementModel from '/server/models/announcementModel';
import {AnnouncementCollection} from 'server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

test('Can save an announcement to DB', async () => {
  // arrange
  const announcement = {
    user_id: 'fakeid',
    announcement: 'happy weekend',
    timestamp: '1665810250',
  };

  // act
  const dbAnnouncement = await announcementModel.createAnnouncement(
    AnnouncementCollection,
    announcement,
  );
  // assert
  expect(dbAnnouncement.user_id).toBe('fakeid');
  expect(dbAnnouncement.announcement).toBe('happy weekend');
});

test('Can get announcements from DB', async () => {
  // arrange
  const announcement = {
    user_id: 'fakeid',
    announcement: 'happy weekend',
    timestamp: '1665810250',
  };

  await announcementModel.createAnnouncement(
    AnnouncementCollection,
    announcement,
  );

  // act
  const dbAnnouncement = await announcementModel.getAnnouncements(
    AnnouncementCollection,
  );

  // assert
  expect(dbAnnouncement).toEqual(
    expect.arrayContaining([expect.objectContaining(announcement)]),
  );
});
