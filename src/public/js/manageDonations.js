/* eslint-disable no-undef */

const getDonations = async (url) => {
  const token = getCookie('token');
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      // data gets all donations in json format
      const {data} = result.data;
      const donations = data.donations;
      if (donations.length === 0) {
        showAddResourceForm();
        return;
      }
      displayDonations(donations);
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const loadDonations = async () => {
  const username = getCookie('currentUser');
  const url = `${API_URL}/donations?username=${username}`;
  getDonations(url);
};

(async () => {
  loadDonations();
})();

const displayDonations = (donations) => {
  let tableContent =
    '<tr><th class="resources"> Resource </th><th class="quantity"> Quantity </th><th class="status"> Status </th><tr>';
  for (index = 0; index < donations.length; index++) {
    let resource = donations[index]['resource'];
    let quantity = donations[index]['quantity'];
    let status = donations[index]['status'];
    const statusList = selectedStatusHTML(status, resource, quantity);
    tableContent += `<tr><td>${resource}</td><td><span class="quantity">&nbsp;&nbsp;&nbsp;&nbsp;${quantity}</span></td><td>${statusList}</td>`;
  }
  tableContent = `<table id="donation-table">${tableContent} </table>`;
  const manageDonations = `<h3><strong><u>Manage Donations</u></strong></h3>
  <br />${tableContent}<br /> <br /><button type="button" class="post-btn" onclick="showAddResourceForm()">
  Add New Resource
</button>`;
  document.querySelector('.container').innerHTML = manageDonations;
};

const selectedStatusHTML = (status, resource, quantity) => {
  let statusList;
  switch (status) {
    case 'available':
      statusList = `<select name="statusList" id="rstatusList" onchange=statusChanged(this.options[this.selectedIndex].value)><option value="available-${resource}-${quantity}" selected>Available</option><option value="reserved-${resource}-${quantity}">Reserved</option><option value="donated-${resource}-${quantity}">Donated</option></select>`;
      break;
    case 'reserved':
      statusList = `<select name="statusList" id="rstatusList" onchange=statusChanged(this.options[this.selectedIndex].value)><option value="available-${resource}-${quantity}">Available</option><option value="reserved-${resource}-${quantity}" selected>Reserved</option><option value="donated-${resource}-${quantity}">Donated</option></select>`;
      break;
    case 'donated':
      statusList = `<select name="statusList" id="rstatusList" onchange=statusChanged(this.options[this.selectedIndex].value)><option value="available-${resource}-${quantity}">Available</option><option value="reserved-${resource}-${quantity}">Reserved</option><option value="donated-${resource}-${quantity}" selected>Donated</option></select>`;
      break;
    default:
      statusList = `<select name="statusList" id="rstatusList" onchange=statusChanged(this.options[this.selectedIndex].value)><option value="available-${resource}-${quantity}" selected>Available</option><option value="reserved-${resource}-${quantity}">Reserved</option><option value="donated-${resource}-${quantity}">Donated</option></select>`;
      break;
  }
  return statusList;
};

const showAddResourceForm = () => {
  const resourceList = [
    'Tents',
    'Sleeping Bags',
    'Food',
    'Whistle',
    'Blankets',
    'Flashlight',
    'Masks',
    'Water Filter',
    'Fire Extinguisher',
    'First Aid Kit',
    'Bandages',
  ];
  let selectResourceHTML = '';
  for (index = 0; index < resourceList.length; index++) {
    selectResourceHTML =
      selectResourceHTML +
      `<option value="${resourceList[index]}">${resourceList[index]}</option>`;
  }

  document.querySelector(
    '.container',
  ).innerHTML = `<h3><strong>Donate Resources</strong></h3>
   <br />
   <form id="resource-form">
     <p>
       <strong><u>Resource Name:</u></strong>
     </p>
     <h4>Select earthquake relief material that you want to donate:</h4>
     <select name="relief-material-list" id="relief-material-list">
       ${selectResourceHTML}
     </select>
     <br />
     <br />
     <br />
     <p>
       <strong><u>Quantity</u></strong>
     </p>
     <h4>Enter quantity of resouce selected for donation:</h4>
     <input
       id="quantity"
       class="input"
       type="number"
       min = "1"
       oninput="validity.valid||(value='');"
       placeholder="0"
       required
     /><br />
     <br />
     <br />
     <br />
     <button type="button" class="post-btn" onclick="saveReliefMaterial()">
       Submit
     </button>
     <br />
   </form>`;

  $('#relief-material-list').select2();
};

// eslint-disable-next-line no-unused-vars
const saveReliefMaterial = async () => {
  const quantity = document.getElementById('quantity');
  const resource = document.getElementById('relief-material-list');

  const url = `${API_URL}/donations`;
  const token = getCookie('token');
  const body = {
    resource: resource.value,
    quantity: quantity.value,
  };
  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      loadDonations();
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

// eslint-disable-next-line no-unused-vars
const updateResourceStatus = async (status, resource, quantity) => {
  const username = getCookie('currentUser');

  const url = `${API_URL}/donations/${username}/${resource}/${quantity}/${status}`;
  const token = getCookie('token');

  const body = {
    status: status,
  };

  await axios
    .put(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then(() => {
      loadDonations();
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

// eslint-disable-next-line no-unused-vars
const statusChanged = async (resourcedetails) => {
  const status = resourcedetails.split('-')[0];
  const resource = resourcedetails.split('-')[1];
  const quantity = parseInt(resourcedetails.split('-')[2]);
  updateResourceStatus(status, resource, quantity);
};
