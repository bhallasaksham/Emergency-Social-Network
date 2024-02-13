import {
  buildFilterTofindUsersWithin100Miles,
  buildWordFilter,
  buildUserFilter,
  buildDonationFilter,
} from '/server/util/queryBuilder';

test('test build user filter with location', () => {
  const query = {
    location: [-122.2283904, 37.3031],
  };

  const expectedFilter = {
    location: {
      $near: {
        $maxDistance: 160934, // distance in meters
        $geometry: {
          type: 'Point',
          coordinates: query.location,
        },
      },
    },
  };

  const filter = buildFilterTofindUsersWithin100Miles(query);

  expect(filter).toStrictEqual(expectedFilter);
});

test('test build user filter w/o location', () => {
  const query = {};
  const filter = buildFilterTofindUsersWithin100Miles(query);
  expect(filter).toStrictEqual({});
});

test('test build word filter with search keywords', () => {
  const query = {
    words: 'test,keywords,fse',
  };

  const expectedFilter = {
    message: {
      $regex: '(?=.*test)(?=.*keywords)(?=.*fse)',
      $options: 'i',
    },
  };

  const filter = buildWordFilter(query, 'message');

  expect(filter).toStrictEqual(expectedFilter);
});

test('test build user filter with search keywords', () => {
  const query = {
    username: 'testUser',
  };

  const expectedFilter = {username: {$regex: query.username, $options: 'i'}};

  const filter = buildUserFilter(query);

  expect(filter).toStrictEqual(expectedFilter);
});

test('test build user filter with searched status', () => {
  const query = {
    status: 'emergency',
  };

  const expectedFilter = {status: 'Emergency'};

  const filter = buildUserFilter(query);

  expect(filter).toStrictEqual(expectedFilter);
});

test('test build donation filter with searched resource', () => {
  const query = {
    resource: 'tents',
  };

  const expectedFilter = {resource: {$regex: query.resource, $options: 'i'}};

  const filter = buildDonationFilter(query);

  expect(filter).toStrictEqual(expectedFilter);
});

test('test build donation filter with searched quantity', () => {
  const query = {
    quantity: 5,
  };

  const expectedFilter = {quantity: 5};

  const filter = buildDonationFilter(query);

  expect(filter).toStrictEqual(expectedFilter);
});

test('test build donation filter to exclude results with given username', () => {
  const query = {
    exclude: 'aishwarya',
  };

  const expectedFilter = {
    status: {$not: {$regex: 'donated', $options: 'i'}},
  };

  const filter = buildDonationFilter(query);

  expect(filter).toStrictEqual(expectedFilter);
});

test('test build user filter to include only active users', () => {
  const query = {
    account_status: 'active',
  };

  const expectedFilter = {
    account_status: 'active',
  };

  const filter = buildUserFilter(query);

  expect(filter).toStrictEqual(expectedFilter);
});
