import Joi from 'joi';
import blockedList from './blockedList';
import {USER_TYPE, ACCOUNT_STATUS} from './enum';
// API Document: https://joi.dev/api/?v=17.6.0

// POST /api/users
const user = Joi.object({
  username: Joi.string()
    .min(3)
    .invalid(...blockedList)
    .required(),
  password: Joi.string().min(4).required(),
});

// POST /api/announcements
const announcement = Joi.object({
  announcement: Joi.string().required(),
});

// POST /api/messages
const message = Joi.object({
  message: Joi.string().required(),
});

// POST /api/messages/private
const privateMessage = Joi.object({
  sender_name: Joi.string().required(),
  receiver_name: Joi.string().required(),
  message: Joi.string().required(),
});

// POST /api/messages/private/chatrooms
const chatroom = Joi.object({
  sender_name: Joi.string().required(),
  receiver_name: Joi.string().required(),
});

// POST /api/emergencies/contacts
const emergencyContact = Joi.object({
  contact_username: Joi.string().required(),
  email_address: Joi.string().allow(null, ''),
  enable_send_public_message: Joi.boolean(),
});

// POST /api/quizzes
const quiz = Joi.object({
  quiz_title: Joi.string().required(),
  option1: Joi.string().required(),
  option2: Joi.string().required(),
});

const status = Joi.object({
  username: Joi.string().required(),
  statusCode: Joi.string().required().valid('ok', 'help', 'emergency'),
});

const donation = Joi.object({
  resource: Joi.string().required(),
  quantity: Joi.number().required().min(1),
});

const locationPreference = Joi.object({
  preference: Joi.string().required().valid('Allowed', 'Not Allowed'),
});

const location = Joi.object({
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
});

const incident = Joi.object({
  severity: Joi.string().required(),
  locationCoordinates: Joi.array().allow(null, ''),
  locationName: Joi.string().required(),
  details: Joi.string().allow(null, ''),
});

const getPrivateMessage = Joi.object({
  chatroom_id: Joi.string().required(),
  words: Joi.string().invalid('undefined'),
  limit: Joi.string().invalid('undefined'),
  offset: Joi.string().invalid('undefined'),
});

const getChatroomsByUser = Joi.object({
  username: Joi.string().required(),
});

const updateUserInfo = Joi.object({
  username: Joi.string()
    .min(3)
    .invalid(...blockedList),
  password: Joi.string().min(4),
  account_status: Joi.string().valid(
    ACCOUNT_STATUS.ACTIVE,
    ACCOUNT_STATUS.INACTIVE,
  ),
  user_type: Joi.string().valid(
    USER_TYPE.ADMINISTRATOR,
    USER_TYPE.CITIZEN,
    USER_TYPE.COORDINATOR,
  ),
}).min(1);

const createMarker = Joi.object({
  username: Joi.string().required(),
  latitude: Joi.string().required(),
  longitude: Joi.string().required(),
  status: Joi.string().required(),
});

export default {
  user,
  message,
  status,
  announcement,
  privateMessage,
  chatroom,
  emergencyContact,
  quiz,
  donation,
  getPrivateMessage,
  getChatroomsByUser,
  locationPreference,
  location,
  incident,
  updateUserInfo,
  createMarker,
};
