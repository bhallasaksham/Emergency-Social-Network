const buildFilterTofindUsersWithin100Miles = (query) => {
  const filter = {};
  if (query.location) {
    const distance = 100;
    const unitValue = 1609.34; // miles to meters
    filter['location'] = {
      $near: {
        $maxDistance: distance * unitValue, // distance in meters
        $geometry: {
          type: 'Point',
          coordinates: query.location,
        },
      },
    };
  }
  return filter;
};

import {STATUS_CODE} from './enum';

const buildWordFilter = (query, searchField) => {
  const filter = {};
  if (query.words) {
    const keywords = query.words.split(',');
    let pattern = '';
    keywords.forEach((keyword) => {
      pattern += `(?=.*${keyword})`;
    });
    filter[searchField] = {$regex: pattern, $options: 'i'};
  }

  return filter;
};

const buildUserFilter = (query) => {
  const filter = {};
  if (query.status) {
    const userStatus = STATUS_CODE[query.status.toUpperCase()];
    filter['status'] = userStatus;
  }
  if (query.username) {
    filter['username'] = {$regex: query.username, $options: 'i'};
  }
  if (query.account_status) {
    filter['account_status'] = query.account_status;
  }
  return filter;
};

const buildDonationFilter = (query) => {
  const filter = {};
  if (query.resource) {
    filter['resource'] = {$regex: query.resource, $options: 'i'};
  }
  if (query.quantity) {
    filter['quantity'] = query.quantity;
  }
  if (query.exclude) {
    filter['status'] = {$not: {$regex: 'donated', $options: 'i'}};
  }
  return filter;
};

export {
  buildFilterTofindUsersWithin100Miles,
  buildWordFilter,
  buildUserFilter,
  buildDonationFilter,
};
