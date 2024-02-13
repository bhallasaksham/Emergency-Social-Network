import path from 'path';

const postAnnouncement = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/postannouncement.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default postAnnouncement;
