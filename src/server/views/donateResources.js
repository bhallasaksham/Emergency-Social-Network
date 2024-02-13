import path from 'path';

const login = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/donate_resources.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default login;
