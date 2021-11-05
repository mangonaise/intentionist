import formatSeconds from '@/logic/utils/formatSeconds'

// 🧪

describe('digital-style formatting', () => {
  test('when time is 0 seconds, formats as 00:00', () => {
    expect(formatSeconds(0, 'digital')).toEqual('00:00')
  })

  test('when time is 1530 seconds, formats as 25:30', () => {
    expect(formatSeconds(1530, 'digital')).toEqual('25:30')
  })

  test('hour digits appear when time reaches 3600 seconds', () => {
    expect(formatSeconds(3600, 'digital')).toEqual('1:00:00')
  })
})

describe('formatting with letter suffixes', () => {
  test('when time is 0 seconds, formats as 0s', () => {
    expect(formatSeconds(0, 'letters')).toEqual('0s')
  })

  test('when time is under 60 seconds, returns only formatted seconds', () => {
    expect(formatSeconds(59, 'letters')).toEqual('59s')
  })

  test('when time equals or exceeds 60 seconds, but less than an hour, returns only formatted minutes', () => {
    expect(formatSeconds(60, 'letters')).toEqual('1m')
  })

  test('when time is between exactly 1 hour and and 1 hour 1 minute, formats as 1h', () => {
    expect(formatSeconds(3600, 'letters')).toEqual('1h')
    expect(formatSeconds(3659, 'letters')).toEqual('1h')
  })

  test('when time exceeds 1 hour 1 minute, formats correctly, without including seconds', () => {
    expect(formatSeconds(8730, 'letters')).toEqual('2h 25m')
  })
})