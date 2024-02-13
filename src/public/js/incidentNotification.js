/* eslint-disable no-undef */

let incidentNotificationModal;
// implement notification popup
(async () => {
  const body = document.getElementsByTagName('body')[0];
  const modalHTML = `
    <div class="incident-notification-modal" id="incident-notification-modal">
    <div class="incident-notification-modal-content">
      <div class="incident-notification-modal-header">
      <span class="close" onclick="onClickCloseIncidentNotificationButton()">&times;</span>
    </div>
    </div>
  </div>
  `;
  body.insertAdjacentHTML('beforeend', modalHTML);
  const message = `A new incident has been reported in your area. Please view the announcements page for more info`;
  const notificationContainer = document.createElement('div');
  notificationContainer.setAttribute(
    'class',
    'incident-notification-container',
  );
  const notificationHTML = `
        <div class="incident-notification-info">
          <div class="incident-notification-message">${message}</div>
        </div>
    `;
  notificationContainer.insertAdjacentHTML('beforeend', notificationHTML);
  incidentNotificationModal = document.getElementById(
    'incident-notification-modal',
  );
  incidentNotificationModal.appendChild(notificationContainer);
  notificationContainer.onclick = () => {
    window.location.replace(`/announcement`);
  };
})();

const showNotificationData = () => {
  incidentNotificationModal.style.display = 'block';
};

const callGetNotificationsAPI = async (url) => {
  const token = getCookie('token');
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      if (data.notifications.length > 0) {
        showNotificationData();
      }
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

// get notification
(async () => {
  const currentUsername = getCookie('currentUser');
  const url = `${API_URL}/incidents/${currentUsername}/notifications`;
  callGetNotificationsAPI(url);
})();

//When the user clicks anywhere outside of the modal, close it
window.onclick = function () {
  incidentNotificationModal.style.display = 'none';
};

// When the user clicks x, close the modal
// eslint-disable-next-line no-unused-vars
const onClickCloseIncidentNotificationButton = () => {
  incidentNotificationModal.style.display = 'none';
};

socket.on('incident', () => {
  const currentUsername = getCookie('currentUser');
  const url = `${API_URL}/incidents/${currentUsername}/notifications`;
  callGetNotificationsAPI(url);
});
