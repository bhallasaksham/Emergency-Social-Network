import path from 'path';

const measurePerformanceReport = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/measure_performance_report.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default measurePerformanceReport;
