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
        disableRequestButton();
        return;
      }
      displayDonations(donations);
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

(async () => {
  const username = getCookie('currentUser');
  const url = `${API_URL}/donations?exclude=${username}`;
  getDonations(url);
})();

const disableRequestButton = () => {
  document.getElementById('donation-table').innerHTML =
    'Sorry! There are no donations available now. Please check again later<br><br>';
  const button = document.querySelector('.post-btn');
  button.style.display = 'none';
};

const displayDonations = (donations) => {
  let tableContent =
    '<tr><th class="selection"> </th><th class="username"> User </th><th class="resources"> Resource </th><th class="quantity"> Qty </th><th class="status"> Status </th><tr>';
  for (index = 0; index < donations.length; index++) {
    let username = donations[index]['username'];
    let resource = donations[index]['resource'];
    let quantity = donations[index]['quantity'];
    let status = donations[index]['status'];
    tableContent += `<tr><td><input type="radio" id="${username}" name="resource-selection" value="${username}-${resource}-${quantity}-"></input></td><td>${username}</td><td>${resource}</td><td><span class="quantity">${quantity}</span></td><td>${status}</td>`;
  }
  tableContent = `<table id="donation-table">${tableContent} </table>`;
  document.getElementById('donation-table').innerHTML = tableContent;
};

/* eslint-disable no-unused-vars */
const startPrivateChat = () => {
  let selectedUser = document.getElementsByName('resource-selection');
  const username = getCookie('currentUser');
  for (index = 0; index < selectedUser.length; index++) {
    if (selectedUser[index].checked) {
      donor = selectedUser[index].value.split('-')[0];
      resource = selectedUser[index].value.split('-')[1];
      quantity = selectedUser[index].value.split('-')[2];
      const url = `${API_URL}/messages/private/chatrooms/members/?sender=${username}&receiver=${donor}`;
      getChatroom(url, donor, resource, quantity);
    }
  }
};

/* eslint-disable no-undef */
const getChatroom = async (url, receiver, resource, quantity) => {
  const token = getCookie('token');
  const sender = getCookie('currentUser');
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      const chatroom = result.data;
      if (chatroom.data) {
        chatroomId = chatroom.data._id;
        postPrivateMessage(sender, receiver, resource, quantity, chatroomId);
      } else {
        createChatroom(receiver, resource, quantity);
      }
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const createChatroom = async (receiver, resource, quantity) => {
  const url = `${API_URL}/messages/private/chatrooms`;
  const currentUsername = getCookie('currentUser');
  const token = getCookie('token');
  const body = {
    sender_name: currentUsername,
    receiver_name: receiver,
  };

  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then((result) => {
      const {data} = result.data;
      const receiver = data.members.filter(
        (member) => member !== currentUsername,
      )[0];
      postPrivateMessage(
        currentUsername,
        receiver,
        resource,
        quantity,
        data.id,
      );
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const postPrivateMessage = async (
  sender,
  receiver,
  resource,
  quantity,
  chatroomId,
) => {
  const token = getCookie('token');
  const url = `${API_URL}/messages/private`;

  const msg = `Hello ${receiver}! I was impacted by the earthquake and I need ${quantity} ${resource}. Can you please help?`;

  const body = {
    sender_name: sender,
    receiver_name: receiver,
    message: msg,
  };
  await axios
    .post(url, Qs.stringify(body), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Access-Control-Allow-Origin': '*',
        Authorization: token,
      },
    })
    .then((result) => {
      window.location.replace(
        `/privatemessage/${chatroomId}?receiver_name=${receiver}`,
      );
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};
