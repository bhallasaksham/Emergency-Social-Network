import path from 'path';

const main = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(__dirname, '../../public/templates/main.html');
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default main;
