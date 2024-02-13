import path from 'path';

const chatroom = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(__dirname, '../../public/templates/chatroom.html');
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default chatroom;
