import donationModel from '/server/models/donationModel';
import userModel from '/server/models/userModel';
import {Donation, User} from '/server/models/schema';
import jwtSign from '/server/util/jwtSign';
import {RESPONSE_TYPE, RESOURCE_STATUS} from '/server/util/enum';
import {
  filterInactiveUserByUsername,
  getUsersByIds,
} from '/server/util/helpers';
import {buildDonationFilter} from '/server/util/queryBuilder';

let donationCollection = Donation;
let userCollection = User;

const saveDonation = async (req, res) => {
  try {
    const token = jwtSign.getToken(req);

    // decode token & get username
    const decodedToken = jwtSign.decodeToken(token);
    const userID = decodedToken.id;
    const status = RESOURCE_STATUS.AVAILABLE;

    const donationEntry = {
      user_id: userID,
      resource: req.body.resource,
      status: status,
      quantity: req.body.quantity,
    };

    await donationModel.createDonationEntry(donationCollection, donationEntry);

    res.status(201).send({
      type: RESPONSE_TYPE.DONATION,
      data: {
        donation: {
          username: decodedToken.username,
          resource: donationEntry.resource,
          status: donationEntry.status,
          quantity: donationEntry.quantity,
        },
      },
      message: 'donation entry created successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.DONATION,
      data: {},
      message: 'internal server error',
    });
  }
};

const getDonations = async (req, res) => {
  try {
    const filter = buildDonationFilter(req.query);

    if (req.query.exclude) {
      const user = await userModel.getUser(userCollection, {
        username: req.query.exclude,
      });
      filter['user_id'] = {$not: {$in: [user._id]}};
    }

    if (req.query.username) {
      const user = await userModel.getUser(userCollection, {
        username: req.query.username,
      });
      filter['user_id'] = user._id;
    }

    const donationList = await donationModel.getDonationResources(
      donationCollection,
      filter,
    );

    const userIds = new Set();
    for (let i = 0; i < donationList.length; i++) {
      userIds.add(donationList[i].user_id);
    }
    const users = await getUsersByIds(userIds);

    for (let i = 0; i < donationList.length; i++) {
      donationList[i].username = users.find(
        (donation) => donation._id.toString() === donationList[i].user_id,
      ).username;
    }

    const inactiveUserSet = await filterInactiveUserByUsername();

    let donations = [];
    for (let i = 0; i < donationList.length; i++) {
      if (inactiveUserSet.has(donationList[i].username)) {
        continue;
      }
      donations.push({
        username: donationList[i].username,
        quantity: donationList[i].quantity,
        status: donationList[i].status,
        resource: donationList[i].resource,
      });
    }

    res.status(200).send({
      type: RESPONSE_TYPE.DONATION,
      data: {donations},
      message: 'success',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.DONATION,
      data: {},
      message: 'internal server error',
    });
  }
};

const updateDonationStatus = async (req, res) => {
  try {
    const filter = buildDonationFilter(req.params);

    const token = jwtSign.getToken(req);
    const decodedToken = jwtSign.decodeToken(token);
    const userID = decodedToken.id;
    filter['user_id'] = userID;

    donationModel.updateDonation(donationCollection, [
      filter,
      {status: req.params.status},
    ]);

    return res.status(200).send({
      type: RESPONSE_TYPE.DONATION,
      data: {
        donation: {
          username: req.params.username,
          resource: req.params.resource,
          quantity: req.params.quantity,
          status: req.params.status,
        },
      },
      message: 'status updated successfully',
    });
  } catch (err) /* istanbul ignore next */ {
    console.log(err);
    return res.status(500).send({
      type: RESPONSE_TYPE.DONATION,
      data: {},
      message: 'internal server error',
    });
  }
};

export default {
  saveDonation,
  getDonations,
  updateDonationStatus,
};
