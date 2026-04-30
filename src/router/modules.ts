import { registerModules } from './register-modules'

import home from '@/modules/home'
import login from '@/modules/login'

registerModules({
	home: home,
	login: login
})
