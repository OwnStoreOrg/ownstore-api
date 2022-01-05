import { Container } from 'inversify'
import getDecorators from 'inversify-inject-decorators'

// Create a container which will hold all dependencies
const appContainer = new Container()

// to avoid circular dependency
export const lazyInject = getDecorators(appContainer, false).lazyInject

export default appContainer
