import { Layouts } from '@/layouts/layouts.types'

const Module = () => import('./Module.vue')
const Topics = () => import('./pages/Topics.vue')
const MessageTemplates = () => import('./pages/MessageTemplates.vue')
const TopicEdit = () => import('./pages/TopicEdit.vue')
const MessageTemplateEdit = () => import('./pages/MessageTemplateEdit.vue')

const moduleRoute = {
	path: '/admin-panel/content-management',
	component: Module,
	children: [
		{
			path: '',
			redirect: 'topics'
		},
		{
			path: 'topics',
			component: Topics,
			meta: { title: 'Topics', layout: Layouts.admin }
		},
		{
			path: 'topics/:id',
			component: TopicEdit,
			meta: { title: 'Редактировать тему', layout: Layouts.admin }
		},
		{
			path: 'message-templates',
			component: MessageTemplates,
			meta: { title: 'Message templates', layout: Layouts.admin }
		},
		{
			path: 'message-templates/:id',
			component: MessageTemplateEdit,
			meta: { title: 'Редактировать шаблон', layout: Layouts.admin }
		}
	]
}

export default (router: any) => {
	router.addRoute(moduleRoute)
}
