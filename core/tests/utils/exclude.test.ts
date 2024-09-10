import exclude from '@/logic/utils/exclude'

it('excludes a single property from an object', () => {
  const obj = { a: 1, b: 2, c: 3 }
  expect(exclude(obj, 'b')).toEqual({ a: 1, c: 3 })
})

it('excludes multiple properties from an object', () => {
  const ages = { arnold: 12, barnold: 23, carnold: 32 }
  expect(exclude(ages, 'arnold', 'barnold')).toEqual({ carnold: 32 })
})

it('returns an object with all the same properties if no keys to remove are supplied', () => {
  const colors = { black: '#000', white: '#fff' }
  expect(exclude(colors)).toEqual(colors)
})