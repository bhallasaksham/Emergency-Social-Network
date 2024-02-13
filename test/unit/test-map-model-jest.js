import mapModel from '/server/models/mapModel';
import {Map} from '/server/models/schema';
import setupMongoDB from './setup-db';

setupMongoDB();

test('Can save marker to DB', () => {
  const newMarker = {
    user_id: 'test-id',
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };

  return mapModel.createMarker(Map, newMarker).then((markerCreated) => {
    expect(markerCreated.user_id).toBe('test-id');
    expect(markerCreated.longitude).toBe('-122.071962');
    expect(markerCreated.latitude).toBe('37.376307');
    expect(markerCreated.status).toBe('help');
  });
});

test('Can get marker details from DB', async () => {
  const newMarker = {
    user_id: 'test-id',
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };

  await mapModel.createMarker(Map, newMarker);

  const marker = await mapModel.getMarker(Map, {
    username: 'testUser',
  });

  expect(marker.user_id).toBe('test-id');
  expect(marker.longitude).toBe('-122.071962');
  expect(marker.latitude).toBe('37.376307');
  expect(marker.status).toBe('help');
});

test('Can get all markers from DB', async () => {
  const newMarker = {
    user_id: 'test-id',
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };

  await mapModel.createMarker(Map, newMarker);

  const markerList = await mapModel.getAllMarkers(Map, {});

  expect(markerList.length).toBe(1);
  expect(markerList[0].user_id).toBe('test-id');
  expect(markerList[0].longitude).toBe('-122.071962');
  expect(markerList[0].latitude).toBe('37.376307');
  expect(markerList[0].status).toBe('help');
});

test('Can delete marker from DB', async () => {
  const newMarker = {
    user_id: 'test-id',
    longitude: '-122.071962',
    latitude: '37.376307',
    status: 'help',
  };

  const marker = await mapModel.createMarker(Map, newMarker);

  await mapModel.deleteMarker(Map, marker._id);
  const markerList = await mapModel.getAllMarkers(Map, {});
  expect(markerList.length).toBe(0);
});
