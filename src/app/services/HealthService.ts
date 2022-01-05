import { IHealthService } from './interface'
import { IHealthStatus } from '../contract/health'
import { injectable } from 'inversify'
import BaseService from './BaseService'
import AppError from '../errors/AppError'

@injectable()
export default class HealthService extends BaseService implements IHealthService {
  public async getHealthStatus(): Promise<IHealthStatus> {
    return {
      message: 'Running...',
    }
  }
}
