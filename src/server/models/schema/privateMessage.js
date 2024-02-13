import mongoose from 'mongoose';

const privateMessageSchema = new mongoose.Schema(
  {
    chatroom_id: {
      type: String,
      require: true,
    },
    sender_id: {
      type: String,
      trim: true,
    },
    timestamp: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    versionKey: false,
  },
);

const PrivateMessage = mongoose.model('PrivateMessage', privateMessageSchema);

export {PrivateMessage};
