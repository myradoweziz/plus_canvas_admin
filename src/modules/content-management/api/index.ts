import { topicsApi } from './topics'
import { messageTemplatesApi } from './message-templates'

export const api = {
	...topicsApi,
	...messageTemplatesApi
}
