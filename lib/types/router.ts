import { ParsedUrlQuery } from 'querystring'

export default interface Router {
  query: ParsedUrlQuery,
  route: string,
  push: (url: string) => void,
  back: () => void,
  replace: (url: string, as?: string | undefined, options?: { shallow?: boolean } | undefined) => void
}