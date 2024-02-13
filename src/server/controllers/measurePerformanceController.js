import {isPerfMode, SetPerfTestInfo} from '/server/util/perfTestMode';
import {RESPONSE_TYPE} from '/server/util/enum';
import jwtSign from '/server/util/jwtSign';
import chatPubliclyController from './chatPubliclyController';
import {Message, TestMessage} from '/server/models/schema';

const startPerformanceTest = async (req, res) => {
  const {id, username} = jwtSign.decodeToken(jwtSign.getToken(req));

  SetPerfTestInfo({userId: id, username, mode: true});
  chatPubliclyController.setMessageCollection(TestMessage);
  return res.status(200).send({
    type: RESPONSE_TYPE.PERFORMANCE,
    data: {},
    message: 'system is now under performance test',
  });
};

const stopPerformanceTest = async (req, res) => {
  if (!isPerfMode()) {
    // if not perf testing, should not allow to call this API
    return res.status(400).send({
      type: RESPONSE_TYPE.PERFORMANCE,
      data: {},
      message: 'system is not under performance test',
    });
  }

  try {
    SetPerfTestInfo({userId: '', username: '', mode: false});

    // 1. delete all messages at test collection
    // 2. switch back to original collection
    chatPubliclyController.deleteAllMessages();
    chatPubliclyController.setMessageCollection(Message);

    return res.status(200).send({
      type: RESPONSE_TYPE.PERFORMANCE,
      data: {},
      message: 'system has now completed performance test.',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.PERFORMANCE,
      data: {},
      message: 'clean up test collection fail, please contact server owener',
    });
  }
};

export default {
  startPerformanceTest,
  stopPerformanceTest,
};
