/* eslint-disable no-undef */

const chatroomsObject = {};

(async () => {
  const token = getCookie('token');
  const username = getCookie('currentUser');
  const url = `${API_URL}/messages/private/chatrooms?username=${username}`;
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      // data gets all users in json format
      const {data} = result.data;

      const chatroomContainer =
        document.getElementsByClassName('chatroom-container')[0];

      data.chatrooms.forEach((chatroom) => {
        // implement chatroom UI structure
        const chatroomName = chatroom.members.filter(
          (member) => member !== username,
        )[0];

        chatroomsObject[chatroomName] = true;

        const chatroomHTML = `
        <div class="chatroom" id=${chatroom._id}>
          <div class="avatar-info-container">
            <div class="circle" style="background: ${
              '#' + Math.floor(Math.random() * 16777215).toString(16) // randam avatar color
            }">${chatroomName[0].toUpperCase()}</div>
            <div class="info">
              <div class="name">${chatroomName}</div>
              <div class="message">&nbsp</div>
            </div>
          </div>
          <div class="timestamp"></div>
          </div>
        </div>
        `;

        chatroomContainer.insertAdjacentHTML('beforeend', chatroomHTML);

        document.getElementById(chatroom._id).onclick = () =>
          window.location.replace(
            `/privatemessage/${chatroom._id}?receiver_name=${chatroomName}`,
          );

        // call msg api
        getMessages(chatroom._id);
      });
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
})();

const getMessages = async (chatroomId) => {
  const token = getCookie('token');
  const url = `${API_URL}/messages/private/?chatroom_id=${chatroomId}&limit=1`;
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      // data gets all users in json format
      const {data} = result.data;
      const messagesList = data.messages;

      const chatroomElem = document.getElementById(chatroomId);
      const chatroomLastMsg = chatroomElem.getElementsByClassName('message')[0];
      const chatroomTimestamp =
        chatroomElem.getElementsByClassName('timestamp')[0];

      // append last msg
      if (data.messages.length !== 0) {
        const msg = messagesList[0].message;
        if (msg.length > 20) {
          chatroomLastMsg.innerHTML = msg.substring(0, 17) + '...';
        } else {
          chatroomLastMsg.innerHTML = msg;
        }
      }

      // append timestamp
      chatroomTimestamp.innerHTML =
        data.messages.length != 0
          ? formatTimestamp(messagesList[messagesList.length - 1].timestamp)
          : '&nbsp';
    })
    .catch((err) => {
      alert(err.response.data.messages);
    });
};

// Create Chatroom Modal
const modal = document.getElementById('post-modal');

const removeUsersfromModal = () => {
  const modalContainer = document.getElementsByClassName('modal-content')[0];
  const userContainer = document.getElementsByClassName('user-container')[0];
  // remove all users
  modalContainer.removeChild(userContainer);
};

// When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = 'none';
    // remove child from parent container
    removeUsersfromModal();
  }
};

// When the user clicks Post Button, open the modal
// eslint-disable-next-line no-unused-vars
const onClickPostButton = () => {
  modal.style.display = 'block';
};

// When the user clicks x, close the modal
// eslint-disable-next-line no-unused-vars
const onClickCloseButton = () => {
  modal.style.display = 'none';
  // remove child from parent container
  removeUsersfromModal();
};

// get all users when modal openes
document.getElementById('new-chatroom').addEventListener('click', () => {
  getUsers();
});

const getUsers = async () => {
  const token = getCookie('token');
  const currentUsername = getCookie('currentUser');
  const url = `${API_URL}/users?account_status=active`;
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      // data gets all users in json format
      const {data} = result.data;

      const modalContainer =
        document.getElementsByClassName('modal-content')[0];

      //UserContainer
      const userContainer = document.createElement('div');
      userContainer.setAttribute('class', 'user-container');

      data.forEach((user) => {
        const {username} = user;

        if (currentUsername === username || chatroomsObject[username]) {
          return;
        }

        const userHTML = `
        <div class="user" id=${username}>
          <div class="avatar-info-container">
            <div class="circle" style="background: ${
              '#' + Math.floor(Math.random() * 16777215).toString(16) // randam avatar color
            }">${username[0].toUpperCase()}</div>
            <div class="info">
            <div class="name">${username}</div>
          </div>
          </div>
        </div>
      `;

        userContainer.insertAdjacentHTML('beforeend', userHTML);
        modalContainer.appendChild(userContainer);

        document.getElementById(username).onclick = () =>
          createChatroom(username);
      });
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};

const createChatroom = async (receiver) => {
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
      window.location.replace(
        `/privatemessage/${data.id}?receiver_name=${receiver}`,
      );
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
};
