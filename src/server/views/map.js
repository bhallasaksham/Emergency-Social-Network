import path from 'path';

const map = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(__dirname, '../../public/templates/map.html');
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default map;
