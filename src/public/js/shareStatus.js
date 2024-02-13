/* eslint-disable no-undef */

const containerDiv = document.querySelector('.selected-status');
const statusUpdatedDiv = document.querySelector('.share-status-message');
let selectedStatus = 'undefined';

// eslint-disable-next-line no-unused-vars
const redClicked = () => {
  statusUpdatedDiv.innerHTML = '';
  containerDiv.innerHTML = `<br> <br> <p> Status Selected: <strong>Emergency</strong>
  </p>
  <br />`;
  selectedStatus = 'emergency';
};

// eslint-disable-next-line no-unused-vars
const yellowClicked = () => {
  statusUpdatedDiv.innerHTML = '';
  containerDiv.innerHTML = `<br> <br> <p> Status Selected: <strong>Help</strong>
  </p>
  <br />`;
  selectedStatus = 'help';
};

// eslint-disable-next-line no-unused-vars
const greenClicked = () => {
  statusUpdatedDiv.innerHTML = '';
  containerDiv.innerHTML = `<br> <br> <p> Status Selected: <strong>Ok</strong>
  </p>
  <br />`;
  selectedStatus = 'ok';
};

// eslint-disable-next-line no-unused-vars
const shareStatus = async () => {
  const username = getCookie('currentUser');
  const url = `${API_URL}/users/${username}/status/${selectedStatus}`;
  await axios
    .patch(url, Qs.stringify(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      setCookie('status', selectedStatus);
      containerDiv.innerHTML = '';
      statusUpdatedDiv.innerHTML = `<br> <br> <p class="status-message-success"> <strong>Successfully updated status! </strong>
  </p>
  <br />`;
    })
    .catch((err) => {
      console.log(err);
      containerDiv.innerHTML = '';
      statusUpdatedDiv.innerHTML = `<br> <br> <p class="status-message-error"> <strong>Error occurred. Could not update status!</strong>
  </p>
  <br />`;
    });
};
