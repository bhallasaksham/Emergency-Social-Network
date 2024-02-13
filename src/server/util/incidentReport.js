import {EARTHQUAKE_SEVERITY} from '/server/util/enum';
const getIncidentAnnouncement = (username, incident) => {
  const severity = incident.severity;
  const message = EARTHQUAKE_SEVERITY[parseInt(severity) - 1];
  let announcement = `${username} has reported an earthquake of severity level ${severity} in ${incident.locationName}. This type of earthquake ${message}.`;
  if (incident.details.length > 0) {
    announcement = announcement.concat(
      ` Additionally, ${username} also reported ${incident.details.toLowerCase()}.`,
    );
  }
  announcement = announcement.concat(
    ` Thank you for reporting the incident, ${username}. Stay Safe everyone!`,
  );
  return announcement;
};

export {getIncidentAnnouncement};
