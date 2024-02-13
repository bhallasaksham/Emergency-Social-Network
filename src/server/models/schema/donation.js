import mongoose from 'mongoose';

const donationSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
    trim: true,
  },
  resource: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const Donation = mongoose.model('Donation', donationSchema);

export {Donation, donationSchema};
