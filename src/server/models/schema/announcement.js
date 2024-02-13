import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    announcement: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  },
);

const AnnouncementCollection = mongoose.model(
  'Announcement',
  announcementSchema,
);

export {AnnouncementCollection};
