import {RESPONSE_TYPE} from '/server/util/enum';
import {AnnouncementCollection} from '/server/models/schema';
import announcementModel from '/server/models/announcementModel';
import jwt from '/server/util/jwtSign';
import {buildWordFilter} from '/server/util/queryBuilder';
import {filterInactiveUserById, getUsersByIds} from '/server/util/helpers';
import {SOCKET_TYPE} from '/server/util/enum';
import {GetSocketIoServerInstance} from '/socketServer';

let announcementCollection = AnnouncementCollection;

const createAccouncementWithSocketEvent = async (query) => {
  await announcementModel.createAnnouncement(announcementCollection, {
    user_id: query.user_id,
    announcement: query.announcement,
    timestamp: query.timestamp,
  });

  GetSocketIoServerInstance().emit(SOCKET_TYPE.ANNOUNCEMENT, {
    sender_name: query.username,
    announcement: query.announcement,
    timestamp: query.timestamp,
  });
};

const saveAnnouncement = async (req, res) => {
  try {
    const announcement = req.body.announcement;
    const token = jwt.getToken(req);
    const user = await jwt.getUserFromToken(token);

    const query = {
      user_id: user._id,
      username: user.username,
      announcement: announcement,
      timestamp: Math.floor(new Date().getTime() / 1000), // timestamp, ex: 1665810250
    };

    await createAccouncementWithSocketEvent(query);

    res.status(201).send({
      type: RESPONSE_TYPE.ANNOUNCEMENT,
      data: {
        announcements: {
          user_id: query.user_id,
          sender_name: user.username,
          timestamp: query.timestamp,
          announcement: query.announcement,
        },
      },
      message: 'announcement create successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.ANNOUNCEMENT,
      data: {},
      message: 'internal server error',
    });
  }
};

const getAnnouncements = async (req, res) => {
  try {
    const filter = buildWordFilter(req.query, 'announcement');
    const announcements = await announcementModel.getAnnouncements(
      announcementCollection,
      filter,
      req.query.limit !== undefined ? req.query.limit : 100,
      req.query.offset !== undefined ? req.query.offset : 0,
    );

    const userIds = new Set();
    for (let i = 0; i < announcements.length; i++) {
      userIds.add(announcements[i].user_id);
    }

    // retrieve user documents by user ID list
    const users = await getUsersByIds(userIds);

    for (let i = 0; i < announcements.length; i++) {
      announcements[i].sender_name = users.find(
        (x) => x._id.toString() === announcements[i].user_id,
      ).username;
    }

    const inactiveUserSet = await filterInactiveUserById();

    let response = [];
    for (let i = 0; i < announcements.length; i++) {
      if (inactiveUserSet.has(announcements[i].user_id.toString())) {
        continue;
      }
      response.push({
        id: announcements[i]._id,
        sender_name: announcements[i].sender_name,
        timestamp: announcements[i].timestamp,
        announcement: announcements[i].announcement,
      });
    }

    res.status(200).send({
      type: RESPONSE_TYPE.ANNOUNCEMENT,
      data: {announcements: response},
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.ANNOUNCEMENT,
      data: {},
      message: 'internal server error',
    });
  }
};

export default {
  saveAnnouncement,
  getAnnouncements,
  createAccouncementWithSocketEvent,
};
