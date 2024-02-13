import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';
import {GetSocketIoServerInstance} from '/socketServer';
import {STATUS_CODE, RESPONSE_TYPE, SOCKET_TYPE} from '/server/util/enum';

const userCollection = User;

const shareStatus = async (req, res) => {
  const username = req.params.username;
  const userStatus = req.params.statusCode.toUpperCase();
  try {
    const timestamp = Math.floor(new Date().getTime() / 1000);
    userModel.updateUserInfo(userCollection, [
      {username: username},
      {
        status: STATUS_CODE[userStatus],
        timestamp: timestamp,
        $push: {statusHistory: STATUS_CODE[userStatus]},
      },
    ]);
    // emit offline user message into socket
    GetSocketIoServerInstance().emit(SOCKET_TYPE.SHARE_STATUS, {
      username: username,
      status: STATUS_CODE[userStatus],
    });
    return res.status(200).send({
      type: RESPONSE_TYPE.USER,
      data: {
        user: {username: username, status: STATUS_CODE[userStatus]},
      },
      message: 'status updated successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.USER,
      data: {},
      message: 'internal server error',
    });
  }
};

export default {
  shareStatus,
};
