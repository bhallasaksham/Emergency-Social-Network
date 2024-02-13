/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

const formatTimestamp = (timestamp) => {
  return dayjs.unix(timestamp).format('HH:mm:ss');
};
