import path from 'path';

const publicWall = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(__dirname, '../../public/templates/publicwall.html');
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default publicWall;
