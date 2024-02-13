import mongoose from 'mongoose';

const emergencyContactSchema = new mongoose.Schema(
  {
    citizen_id: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    contact_user_id: {
      type: String,
      required: true,
    },
    email_address: {
      type: String,
      trim: true,
    },
    enable_send_public_message: {
      type: Boolean,
      default: false,
    },
  },
  {
    versionKey: false,
  },
);

const EmergencyContact = mongoose.model(
  'EmergencyContact',
  emergencyContactSchema,
);

export {EmergencyContact};
