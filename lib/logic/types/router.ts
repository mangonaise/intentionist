import { ParsedUrlQuery } from 'querystring'

export default interface Router {
  query: ParsedUrlQuery,
  push: (url: string) => void,
  back: () => void
}