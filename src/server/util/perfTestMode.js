const perfInfo = {
  inPerfTest: false,
  adminUserObjectId: '',
  adminUsername: '',
};

const isPerfMode = () => {
  return perfInfo['inPerfTest'];
};

const GetCurrentPerfUserId = () => {
  return perfInfo['adminUserObjectId'] ? perfInfo['adminUserObjectId'] : '';
};

const SetPerfTestInfo = ({userId = '', username = '', mode = false}) => {
  perfInfo['adminUserObjectId'] = userId;
  perfInfo['inPerfTest'] = mode;
  perfInfo['adminUsername'] = username;
};

export {isPerfMode, GetCurrentPerfUserId, SetPerfTestInfo};
