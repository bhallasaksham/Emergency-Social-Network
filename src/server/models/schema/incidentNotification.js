import {mongoose} from 'mongoose';

const incidentNotificationSchema = new mongoose.Schema({
  receiver_id: {
    type: String,
    require: true,
  },
});

const IncidentNotification = mongoose.model(
  'IncidentNotification',
  incidentNotificationSchema,
);

export {IncidentNotification, incidentNotificationSchema};
