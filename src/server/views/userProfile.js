import path from 'path';

const userProfile = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(__dirname, '../../public/templates/userprofile.html');
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default userProfile;
