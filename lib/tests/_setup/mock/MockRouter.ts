import Router from '../../../logic/types/router'
import { ParsedUrlQuery } from 'querystring'
import { singleton } from 'tsyringe'

@singleton()
export default class MockRouter implements Router {
  query: ParsedUrlQuery
  route = 'mock-route'
  constructor() {
    this.query = { id: undefined }
  }
  push = jest.fn()
  back = jest.fn()
  replace = jest.fn()
  setQuery = (query: ParsedUrlQuery) => { this.query = query }
}