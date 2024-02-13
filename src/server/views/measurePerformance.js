import path from 'path';

const measurePerformance = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/measure_performance.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default measurePerformance;
