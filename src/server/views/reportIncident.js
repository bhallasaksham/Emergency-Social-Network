import path from 'path';

const reportIncident = (_req, res) => {
  let filepath, filename;
  filepath = path.resolve(
    __dirname,
    '../../public/templates/report_incident.html',
  );
  filename = path.join(filepath);
  res.sendFile(filename);
};

export default reportIncident;
