/* istanbul ignore file */

import path from 'path';

const login = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(__dirname, '../../public/templates/login.html');
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default login;
