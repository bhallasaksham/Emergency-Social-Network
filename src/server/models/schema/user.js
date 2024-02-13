import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 100,
    trim: true,
  },
  online: {
    type: Boolean,
    required: true,
  },
  // Example: Emergency, OK, Help, Undefined
  status: {
    type: String,
    default: 'Undefined',
    trim: true,
  },
  statusHistory: {
    type: Array,
    default: ['Undefined'],
  },
  user_type: {
    type: String,
    default: 'citizen',
    trim: true,
  },
  account_status: {
    type: String,
    default: 'active',
    trim: true,
  },
  timestamp: {
    type: String,
    default: 'Undefined',
    trim: true,
  },
  trackLocation: {
    // can be 'Undefined', 'Not Allowed', 'Allowed'
    type: String,
    default: 'Undefined',
    trim: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
    },
    coordinates: {
      type: [Number],
    },
  },
});

userSchema.index({location: '2dsphere'});

const User = mongoose.model('User', userSchema);

export {User, userSchema};
