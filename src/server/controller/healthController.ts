import Hapi from '@hapi/hapi'
import { IHealthService } from '../../app/services/interface'
import AppTypes from '../../app/AppTypes'
import { IHealthStatus } from '../../app/contract/health'
import appContainer from '../../app/container'

const register = async (server: Hapi.Server): Promise<void> => {
  server.realm.modifiers.route.prefix = '/health'

  server.route({
    path: '/status',
    method: 'get',
    options: {},
    handler: async (request: Hapi.Request): Promise<IHealthStatus> => {
      const healthService = appContainer.get<IHealthService>(AppTypes.HealthService)
      const healthStatus = await healthService.getHealthStatus()
      return healthStatus
    },
  })
}

export default (): Hapi.Plugin<any> => {
  return {
    register,
    name: 'healthController',
    version: '1.0.0',
  }
}
