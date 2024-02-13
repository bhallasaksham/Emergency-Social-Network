import path from 'path';

const selfAssessment = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/self_assessment.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default selfAssessment;
