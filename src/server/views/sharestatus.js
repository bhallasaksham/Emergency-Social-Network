import path from 'path';

const shareStatus = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/share_status.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default shareStatus;
