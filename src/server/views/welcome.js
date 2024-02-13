import path from 'path';

const welcome = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(__dirname, '../../public/templates/welcome.html');
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default welcome;
