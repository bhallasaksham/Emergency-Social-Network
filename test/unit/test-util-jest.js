import {
  isPerfMode,
  GetCurrentPerfUserId,
  SetPerfTestInfo,
} from '/server/util/perfTestMode';

test('isPerfMode should be false as default', () => {
  // assert
  expect(isPerfMode()).toBe(false);
});

test('GetCurrentPerfUserId default is empty string', () => {
  // assert
  expect(GetCurrentPerfUserId()).toBe('');
});

test('SetPerfTestInfo call w/ default value should be false', () => {
  // act
  SetPerfTestInfo({});

  // assert
  expect(isPerfMode()).toBe(false);
  expect(GetCurrentPerfUserId()).toBe('');
});

test('SetPerfTestInfo should update perf test info', () => {
  // act
  SetPerfTestInfo({userId: 'fake id', username: 'fake username', mode: true});

  // assert
  expect(isPerfMode()).toBe(true);
  expect(GetCurrentPerfUserId()).toBe('fake id');
});
