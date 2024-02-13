import path from 'path';

const selfAssessmentQuiz = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/self_assessment_quiz.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default selfAssessmentQuiz;
