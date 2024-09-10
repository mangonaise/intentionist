import { separateYYYYfromMMDD } from '@/logic/utils/dateUtilities'

it('works', () => {
  expect(separateYYYYfromMMDD('2021-10-25')).toEqual({
    yyyy: '2021',
    mmdd: '10-25'
  })
})