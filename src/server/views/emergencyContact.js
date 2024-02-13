import path from 'path';

const emergencyContact = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/emergencycontact.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default emergencyContact;
