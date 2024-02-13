import path from 'path';

const privateMessage = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/privateMessage.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default privateMessage;
