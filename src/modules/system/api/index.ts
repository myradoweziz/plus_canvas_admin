import { activityLogApi } from './activity-log'
import { systemWarningsApi } from './system-warnings'

export const api = {
	...activityLogApi,
	...systemWarningsApi
}
