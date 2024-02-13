/* eslint-disable no-undef */

// implement notification modal
(() => {
  const body = document.getElementsByTagName('body')[0];
  const modalHTML = `
    <div class="notification-modal" id="notification-modal">
    <div class="notification-modal-content">
      <div class="notification-modal-header">
        <span class="close" onclick="onClickCloseNotificationButton()">&times;</span>
        <p>You have new private messages</p>
      </div>
    </div>
  </div>
  `;

  body.insertAdjacentHTML('beforeend', modalHTML);
})();

// Create Chatroom Modal
const notificationModal = document.getElementById('notification-modal');
const modalNotificationContainer = document.getElementsByClassName(
  'notification-modal-content',
)[0];

const generateChatroomHTML = (senderName, message, timestamp) => {
  return `
    <div class="notification-chatroom">
      <div class="notification-info-container">
        <div class="notification-circle" style="background: ${
          '#' + Math.floor(Math.random() * 16777215).toString(16) // randam avatar color
        }">${senderName[0].toUpperCase()}</div>
        <div class="notification-info">
          <div class="notification-name">${senderName}</div>
          <div class="notification-message">${message}</div>
        </div>
      </div>
      <div class="timestamp">${formatTimestamp(timestamp)}</div>
      </div>
    </div>
    `;
};

// get notification
(async () => {
  const token = getCookie('token');
  const currentUsername = getCookie('currentUser');
  const url = `${API_URL}/messages/notifications?username=${currentUsername}`;
  await axios
    .get(url, {
      headers: {
        Authorization: token,
      },
    })
    .then((result) => {
      // data gets all users in json format
      const {data} = result.data;

      const chatroomContainer = document.createElement('div');
      chatroomContainer.setAttribute(
        'class',
        'notification-chatroom-container',
      );

      data.notifications.forEach((notification, index) => {
        let {chatroom_id, sender_name, message, timestamp} = notification;
        if (message.length > 20) {
          message = message.substring(0, 17) + '...';
        }

        const chatroomHTML = generateChatroomHTML(
          sender_name,
          message,
          timestamp,
        );

        chatroomContainer.insertAdjacentHTML('beforeend', chatroomHTML);
        // add onclick function
        chatroomContainer.getElementsByClassName('notification-chatroom')[
          index
        ].onclick = () => {
          window.location.replace(
            `/privatemessage/${chatroom_id}?receiver_name=${sender_name}`,
          );
        };
      });

      modalNotificationContainer.appendChild(chatroomContainer);

      if (data.notifications.length > 0) {
        notificationModal.style.display = 'block';
      }
    })
    .catch((err) => {
      alert(err.response.data.message);
    });
})();

const removeUnreadChatroom = () => {
  const notificationModalContainer = document.getElementsByClassName(
    'notification-modal-content',
  )[0];
  const chatroomContainer = document.getElementsByClassName(
    'notification-chatroom-container',
  )[0];
  // remove all data
  notificationModalContainer.removeChild(chatroomContainer);
};

//When the user clicks anywhere outside of the modal, close it
window.onclick = function (event) {
  if (event.target == notificationModal) {
    notificationModal.style.display = 'none';
    removeUnreadChatroom();
  }
};

// When the user clicks x, close the modal
// eslint-disable-next-line no-unused-vars
const onClickCloseNotificationButton = () => {
  notificationModal.style.display = 'none';
  removeUnreadChatroom();
};

socket.on('private-message', (msg) => {
  let {sender_name, message, timestamp, chatroom_id} = msg;
  let chatroomContainer;
  const username = getCookie('currentUser');

  // should not show msg notification from oneself
  if (sender_name == username) {
    return;
  }

  // slice the string to prevent user circle been compressed
  if (message.length > 20) {
    message = message.substring(0, 17) + '...';
  }

  if (
    document.getElementsByClassName('notification-chatroom-container').length >
    0
  ) {
    chatroomContainer = document.getElementsByClassName(
      'notification-chatroom-container',
    )[0];
  } else {
    chatroomContainer = document.createElement('div');
    chatroomContainer.setAttribute('class', 'notification-chatroom-container');
  }

  // generate chatroom UI
  const chatroomHTML = generateChatroomHTML(sender_name, message, timestamp);
  chatroomContainer.insertAdjacentHTML('beforeend', chatroomHTML);
  // add onclick function
  chatroomList = chatroomContainer.getElementsByClassName(
    'notification-chatroom',
  );
  chatroomList[chatroomList.length - 1].onclick = () => {
    window.location.replace(
      `/privatemessage/${chatroom_id}?receiver_name=${sender_name}`,
    );
  };
  modalNotificationContainer.appendChild(chatroomContainer);
  // open modal
  notificationModal.style.display = 'block';
});
