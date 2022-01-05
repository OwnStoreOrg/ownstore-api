import { IUserInfo } from '../app/contract/user'

export interface IServerAppState {
  user: IUserInfo | null
  responseTtl: number | null // seconds
}
