import path from 'path';

const selfAssessmentResult = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/self_assessment_result.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default selfAssessmentResult;
