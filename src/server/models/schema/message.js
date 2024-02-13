import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
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
});

const Message = mongoose.model('Message', messageSchema);
const TestMessage = mongoose.model('TestMessage', messageSchema);

export {Message, TestMessage, messageSchema};
