import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    chatroom_id: {
      type: String,
      require: true,
    },
    sender_id: {
      type: String,
      require: true,
    },
    receiver_id: {
      type: String,
      require: true,
    },
    timestamp: {
      type: String,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
  },
  {
    versionKey: false,
  },
);

const Notification = mongoose.model('Notification', notificationSchema);

export {Notification, notificationSchema};
