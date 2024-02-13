const RESPONSE_TYPE = {
  REGISTER: 'register',
  LOGIN: 'login',
  LOGOUT: 'logout',
  USER: 'user',
  MESSAGE: 'message',
  CHAT: 'chat',
  PERFORMANCE: 'performance',
  ANNOUNCEMENT: 'announcement',
  EMERGENCY_CONTACT: 'emergency_contact',
  QUIZ: 'quiz',
  MAP: 'map',
  DONATION: 'donation',
  UNKNOWN: 'unknown',
  LOCATION: 'location',
  INCIDENT: 'incident',
};

const STATUS_CODE = {
  UNDEFINED: 'Undefined',
  OK: 'OK',
  HELP: 'Help',
  EMERGENCY: 'Emergency',
};

const SOCKET_TYPE = {
  PRIVATE_MESSAGE: 'private-message',
  PUBLIC_MESSAGE: 'public-message',
  SHARE_STATUS: 'share-status',
  UPDATE_ONLINE_STATUS: 'update-online-status',
  ANNOUNCEMENT: 'announcement',
  INCIDENT: 'incident',
  ACCOUNT_STATUS: 'account-status',
};

const RESOURCE_STATUS = {
  AVAILABLE: 'available',
  RESERVED: 'reserved',
  DONATED: 'donated',
};

const EARTHQUAKE_SEVERITY = [
  'is noticeable indoors, especially on upper floors, but may not be recognized as an earthquake',
  'is felt by many indoors, few outdoors. It may feel like a heavy truck passing by',
  'is felt by everyone. It is usually difficult to stand during these earthquakes. Some heavy furniture may move, some plaster may fall. Chimneys may be slightly damaged',
  'causes little damage in specially build structures. It may cause considerable damage to ordinary buildings, and severe damage to poorly built structures. Some walls may collapse',
  'causes total damage. Waves are seen on the ground. Objects are thrown up into the air.',
];

const USER_TYPE = {
  CITIZEN: 'citizen',
  COORDINATOR: 'coordinator',
  ADMINISTRATOR: 'administrator',
};

const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
};

export {
  STATUS_CODE,
  RESPONSE_TYPE,
  SOCKET_TYPE,
  RESOURCE_STATUS,
  EARTHQUAKE_SEVERITY,
  USER_TYPE,
  ACCOUNT_STATUS,
};
