import { separateYYYYfromMMDD } from '@/logic/utils/dateUtilities'

describe('separateYYYYfromMMDD', () => {
  it('works', () => {
    expect(separateYYYYfromMMDD('2021-10-25')).toEqual({
      yyyy: '2021',
      mmdd: '10-25'
    })
  })
})