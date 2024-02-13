import {config} from '/config/config';
import chatPubliclyController from './chatPubliclyController';
import chatPrivatelyController from './chatPrivatelyController';
import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';

const userCollection = User;

// The constructor to decorate
class Notifier {
  constructor() {}

  send = async (contactInfo) => {
    const msg = {
      chatroom_id: contactInfo['chatroom_id'],
      sender_name: contactInfo['citizen'],
      timestamp: Math.floor(new Date().getTime() / 1000),
      status: contactInfo['status'],
      message: `It's an earthquake!! I need help!! My Location: ${contactInfo['location']}`,
    };
    await chatPrivatelyController.createPrivateMessageSendSocketEvent(
      contactInfo['citizen'],
      contactInfo['receiver'],
      msg,
    );
  };
}

const PublicWallDecorator = (notifier) => {
  const send = notifier.send;

  notifier.send = async (contactInfo) => {
    await send(contactInfo);

    const user = await userModel.getUser(userCollection, {
      username: contactInfo['citizen'],
    });

    // prepare & send public message to public wall
    const msg = {
      user_id: user._id.toString(),
      message: `It's an earthquake!! I need help!! My Location: ${contactInfo['location']}`,
      timestamp: Math.floor(new Date().getTime() / 1000),
      status: contactInfo['status'],
    };
    await chatPubliclyController.createMessageAndSendSocketEvent(msg);
  };
};

const EmailDecorator = (notifier, sendgridClient) => {
  const send = notifier.send;
  const client = sendgridClient;

  notifier.send = async (contactInfo) => {
    await send(contactInfo);

    client.send({
      to: contactInfo['email_address'],
      from: 'emergencysocialnetworkf22sb1@gmail.com',
      subject: `[ESN] ${contactInfo['citizen']} Needs Your Help`,
      html: `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width initial-cale=1.0" />
          <style>
            .msg {
              display: flex;
              align-items: flex-end;
              margin-bottom: 10px;
            }
            .msg-bubble {
              max-width: 300px;
              padding: 15px;
              border-radius: 15px;
              background: #ececec;
            }
            .msg-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .msg-info-name {
              margin-right: 10px;
              font-weight: bold;
            }
            .msg-info-status {
              margin-top: 1em;
              font-size: 0.85em;
              float: right;
            }
          </style>
        </head>
        <body>
          <div>
            Hi ${contactInfo['receiver']}<br /><br />
            You're receiving this email because you're ${contactInfo['citizen']}'s emergency
            contact.<br />
            Please login
            <a href="https://f22esnb1.onrender.com/">SB1 Emergency Social Network</a>
            to reply, or call 911 to help your friend.<br />
            <br /><br />Here is your friend's message:<br /><br />
      
            <div class="msg left-msg">
              <div class="msg-bubble">
                <div class="msg-info">
                  <div class="msg-info-name">${contactInfo['citizen']}</div>
                </div>
                <div class="msg-text">
                  <strong>It's an earthquake!! I need Help!! </strong><br />
                  My Location: ${contactInfo['location']} <br /><br />
                </div>
                <div class="msg-info-status">status: ${contactInfo['status']}</div>
              </div>
            </div>
            <br />
            Regards<br /><br />
            ESN SB1 Support
            <br />
          </div>
        </body>
      </html>
    `,
    });
  };
};

class SendgridClient {
  constructor(apiKey) {
    this.sgMail = require('@sendgrid/mail');
    this.sgMail.setApiKey(apiKey);
  }

  /* istanbul ignore next */
  send = (emailObj) => {
    this.sgMail.send(emailObj);
  };
}

const sendgridClient = new SendgridClient(config.sendgridAPIKey);

export {Notifier, PublicWallDecorator, EmailDecorator, sendgridClient};
