import {getIncidentAnnouncement} from '/server/util/incidentReport';
import userModel from '/server/models/userModel';
import {User} from '/server/models/schema';
import {IncidentNotification} from '/server/models/schema/incidentNotification';
import notificationModel from '/server/models/notificationModel';
import {buildFilterTofindUsersWithin100Miles} from '/server/util/queryBuilder';
import jwtSign from '/server/util/jwtSign';
import {RESPONSE_TYPE, SOCKET_TYPE} from '/server/util/enum';
import {GetSocketIoServerInstance} from '/socketServer';
import postAnnouncementController from './postAnnouncementController';

const userCollection = User;
const notificationCollection = IncidentNotification;

const createIncidentAnnouncement = async (username, incidentReport) => {
  const capitalizedUsername =
    username.charAt(0).toUpperCase() + username.slice(1);
  const announcement = getIncidentAnnouncement(
    capitalizedUsername,
    incidentReport,
  );
  const user = await userModel.getUser(userCollection, {
    username: 'esnadmin',
  });
  const query = {
    user_id: user._id.toString(),
    username: user.username,
    announcement: announcement,
    timestamp: Math.floor(new Date().getTime() / 1000), // timestamp, ex: 1665810250
  };

  postAnnouncementController.createAccouncementWithSocketEvent(query);
};

const createIncidentNotification = async (username, incidentReport) => {
  const location = incidentReport.locationCoordinates.map(Number);
  const filter = buildFilterTofindUsersWithin100Miles({location: location});
  const result = await userModel.getUsers(userCollection, filter);
  result.forEach(async (user) => {
    if (user.username === username) {
      return;
    }
    const notifications = {
      receiver_id: user._id.toString(),
    };
    await notificationModel.createNotification(
      notificationCollection,
      notifications,
    );
    GetSocketIoServerInstance().emit(SOCKET_TYPE.INCIDENT, {});
  });
};

const processIncidentReport = async (req, res) => {
  try {
    const username = req.params.username;
    await createIncidentAnnouncement(username, req.body, res);
    if (req.body.locationCoordinates) {
      await createIncidentNotification(username, req.body);
    }
    res.status(201).send({
      type: RESPONSE_TYPE.INCIDENT,
      data: {},
      message: 'Thank you for reporting the incident!',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.INCIDENT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getIncidentNotificationsByUser = async (req, res) => {
  try {
    const token = jwtSign.getToken(req);
    const user = await jwtSign.getUserFromToken(token);
    const notifications = await notificationModel.getNotificationsById(
      notificationCollection,
      {receiver_id: user._id.toString()},
    );
    await notificationModel.clearNotificationsById(notificationCollection, {
      receiver_id: user._id.toString(),
    });

    res.status(200).send({
      type: RESPONSE_TYPE.INCIDENT,
      data: {notifications},
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.INCIDENT,
      data: {},
      message: 'internal server error',
    });
  }
};

export default {
  processIncidentReport,
  getIncidentNotificationsByUser,
};
