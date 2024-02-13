/* istanbul ignore file */

import {Server} from 'socket.io';
import expressServer from 'expressServer';
import userController from 'server/controllers/userController';
import chatPrivatelyController from 'server/controllers/chatPrivatelyController';
import jwtSign from '/server/util/jwtSign';

const io = new Server(expressServer, {
  cors: {
    origin: '*',
  },
});

const GetSocketIoServerInstance = () => {
  return io;
};

const OnConnectHandler = async (socket) => {
  const token = jwtSign.getToken(socket);
  userController.updateOnlineStatus(token, true);

  // join the socket to room by chatroom_id
  // ref: https://socket.io/docs/v3/rooms/
  const user = await jwtSign.getUserFromToken(token);
  const chatrooms = await chatPrivatelyController.getChatroomModelsByUserModel(
    user.username,
  );
  for (let i = 0; i < chatrooms.length; i++) {
    socket.join(chatrooms[i]._id.toString());
  }

  socket.on('disconnect', async () => {
    userController.updateOnlineStatus(token, false);
  });
};

export {GetSocketIoServerInstance, OnConnectHandler};
