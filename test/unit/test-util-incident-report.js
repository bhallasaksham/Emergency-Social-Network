import {getIncidentAnnouncement} from '/server/util/incidentReport';
import {EARTHQUAKE_SEVERITY} from '/server/util/enum';

test('test incident announcement creation', () => {
  const username = 'Saksham';

  const incidentData = {
    severity: '4',
    locationCoordinates: [-122.2283904, 37.3031],
    locationName: 'Redwood City, CA',
    details:
      'There is severe damage on inner roads, can someone help with getting food here',
  };

  const earthquakeType =
    EARTHQUAKE_SEVERITY[parseInt(incidentData.severity) - 1];

  const expectedAnnouncement = `${username} has reported an earthquake of severity level 4 in Redwood City, CA. This type of earthquake ${earthquakeType}. Additionally, ${username} also reported there is severe damage on inner roads, can someone help with getting food here. Thank you for reporting the incident, ${username}. Stay Safe everyone!`;

  const announcement = getIncidentAnnouncement(username, incidentData);

  expect(announcement).toBe(expectedAnnouncement);
});

test('test incident announcement creation w/o details', () => {
  const username = 'Saksham';

  const incidentData = {
    severity: '4',
    locationCoordinates: [-122.2283904, 37.3031],
    locationName: 'Redwood City, CA',
    details: '',
  };

  const earthquakeType =
    EARTHQUAKE_SEVERITY[parseInt(incidentData.severity) - 1];

  const expectedAnnouncement = `${username} has reported an earthquake of severity level 4 in Redwood City, CA. This type of earthquake ${earthquakeType}. Thank you for reporting the incident, ${username}. Stay Safe everyone!`;

  const announcement = getIncidentAnnouncement(username, incidentData);

  expect(announcement).toBe(expectedAnnouncement);
});

test('test incident announcement creation w/o details and locationCoordinates', () => {
  const username = 'Saksham';

  const incidentData = {
    severity: '4',
    locationName: 'Redwood City, CA',
    details: '',
  };

  const earthquakeType =
    EARTHQUAKE_SEVERITY[parseInt(incidentData.severity) - 1];

  const expectedAnnouncement = `${username} has reported an earthquake of severity level 4 in Redwood City, CA. This type of earthquake ${earthquakeType}. Thank you for reporting the incident, ${username}. Stay Safe everyone!`;

  const announcement = getIncidentAnnouncement(username, incidentData);

  expect(announcement).toBe(expectedAnnouncement);
});
