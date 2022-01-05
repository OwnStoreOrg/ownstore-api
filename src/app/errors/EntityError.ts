import AppError from './AppError'

export class EntityNotFoundError extends AppError {
  public constructor(entityName: string, id: number) {
    super(404, `Entity ${entityName} not found for id ${id}`, 'ENTITY_NOT_FOUND')
  }
}
