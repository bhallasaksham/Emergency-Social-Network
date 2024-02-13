import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema({
  quiz_title: {
    type: String,
    required: true,
    unique: true,
  },
  option1: {
    type: String,
    required: true,
  },
  option2: {
    type: String,
    required: true,
  },
  option3: {
    type: String,
    default: 'Undefined',
  },
  option4: {
    type: String,
    default: 'Undefined',
  },
  type: {
    type: String,
    default: 'Single', // type can be single or multiple types
  },
  answer: {
    type: Array,
    default: 'Undefined',
  },
});

const Quiz = mongoose.model('Quiz', quizSchema);

export {Quiz, quizSchema};
