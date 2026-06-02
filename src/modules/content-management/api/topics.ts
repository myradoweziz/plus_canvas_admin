import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { Topic, TopicPayload } from '../types'

const TOPICS_URL = '/api/admin/topics'

export type ListTopicsParams = {
	store_id?: number
	limit: number
	offset: number
}

const listTopics = createListApi<Topic, ListTopicsParams>({ url: TOPICS_URL })

function toTopicPayload(topic: Topic): TopicPayload {
	return {
		system_name: topic.system_name,
		is_password_protected: topic.is_password_protected,
		password: topic.is_password_protected ? topic.password : '',
		include_in_sitemap: topic.include_in_sitemap,
		include_in_top_menu: topic.include_in_top_menu,
		title: topic.title,
		body: topic.body,
		slug: topic.slug,
		meta_title: topic.meta_title,
		meta_description: topic.meta_description,
		meta_keywords: topic.meta_keywords,
		store_id: Number(topic.store_id) || 0
	}
}

async function getTopicById(id: number): Promise<Topic> {
	return await request({ url: `${TOPICS_URL}/${id}`, method: 'GET' })
}

async function createTopic(topic: Topic): Promise<Topic> {
	return await request({ url: TOPICS_URL, method: 'POST', data: toTopicPayload(topic) })
}

async function updateTopic(topic: Topic): Promise<Topic> {
	return await request({
		url: `${TOPICS_URL}/${topic.id}`,
		method: 'PUT',
		data: toTopicPayload(topic)
	})
}

async function deleteTopic(id: number): Promise<void> {
	await request({ url: `${TOPICS_URL}/${id}`, method: 'DELETE' })
}

export const topicsApi = {
	listTopics,
	getTopicById,
	createTopic,
	updateTopic,
	deleteTopic
}
