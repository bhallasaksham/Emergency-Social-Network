/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */

let coordinates = [];
let locationName = document.getElementById('location').value;
const incidentReportDiv = document.querySelector('.reported-successfully');
const username = getCookie('currentUser');

const callGetLocationAPI = async (url) => {
  const token = getCookie('token');

  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      coordinates = data.coordinates;
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const resetForm = () => {
  $('#severity').val('choose').trigger('change');
  document.getElementById('additional_details').value = '';
};

const callPostIncidentAPI = async (url, severity, details) => {
  locationName = document.getElementById('location').value;

  const body = {
    severity: severity,
    locationCoordinates: coordinates,
    locationName: locationName,
    details: details,
  };
  const token = getCookie('token');
  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const response = result.data;
      showIncidentReportedMessageOnUI(response.message);
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

// https://www.bigdatacloud.com/blog/convert-getcurrentposition-free-reversegeocoding-api
const getCurrentCityName = async (latitude, longitude) => {
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
  await axios
    .get(url)
    .then((result) => {
      const data = result.data;
      locationName = data.locality + ', ' + data.principalSubdivision;
      document.getElementById('location').value = locationName;
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const reportIncident = async () => {
  const severity = document.getElementById('severity').value;
  if (severity === 'choose') {
    alert('Please select a severity level');
    resetForm();
    return;
  }
  let details = '';
  if (document.getElementById('additional_details').value) {
    details = document.getElementById('additional_details').value;
  }

  const url = `${API_URL}/incidents/${username}/reports`;
  await callPostIncidentAPI(url, severity, details);
};

document.body.addEventListener(
  'click',
  () => {
    if (
      document.getElementById('report-incident-btn').style.display === 'none'
    ) {
      incidentReportDiv.innerHTML = '';
      document.getElementById('report-incident-btn').style.display = 'block';
    }
  },
  true,
);

const showIncidentReportedMessageOnUI = (message) => {
  incidentReportDiv.innerHTML = `<br> <br> <p class="incident-report-success"> <strong>${message}</strong>`;
  document.getElementById('report-incident-btn').style.display = 'none';
  resetForm();
};

(async () => {
  incidentReportDiv.innerHTML = '';
  $('#severity').select2();
  const locationPreference = getCookie('locationPreference');
  if (locationPreference == 'Not Allowed') {
    await askUserForLocationPreferences(
      'Allow location sharing to get notified if a nearby citizen reports earthquake?',
    );
  } else {
    const url = `${API_URL}/users/${username}/location`;
    await callGetLocationAPI(url);
    const longitude = coordinates[0];
    const latitude = coordinates[1];
    await getCurrentCityName(latitude, longitude);
  }
})();
