import mongoose from 'mongoose';

const mapSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    trim: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    trim: true,
  },
});

const Map = mongoose.model('Map', mapSchema);

export {Map};
