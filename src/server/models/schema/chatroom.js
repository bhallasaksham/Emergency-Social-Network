import mongoose from 'mongoose';

const chatroomSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
      required: true,
    },
  },
  {
    versionKey: false,
  },
);

const Chatroom = mongoose.model('Chatroom', chatroomSchema);

export {Chatroom, chatroomSchema};
