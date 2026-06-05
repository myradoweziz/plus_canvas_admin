<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
import Button from '@/shared/ui/Button.vue'
import DeleteModal from '@/shared/ui/DeleteModal.vue'
import Pagination from '@/shared/ui/Pagination.vue'
import SelectField from '@/shared/ui/SelectField.vue'
import TopicsTable from '../components/TopicsTable.vue'
	const TopicCreateModal = defineAsyncComponent(() => import('../components/TopicCreateModal.vue'))

	import { api as configurationApi } from '@/modules/configuration/api'
import type { Store } from '@/modules/configuration/types'
import { getFirstBackendValidationMessage } from '@/shared/api/validation'
import { DocsIcon } from '@/shared/icons'
import { api } from '../api'
import type { Topic } from '../types'

	const router = useRouter()

	const loading = ref(false)
	const topics = ref<Topic[]>([])
	const showTopicModal = ref(false)
	const selectedTopic = ref<Topic | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(15)
	const offset = ref(0)
	const filters = ref<{ store_id?: number }>({})
	const stores = ref<{ label: string; value: number }[]>([])
	const loadingStores = ref(false)

	const loadStores = async () => {
		loadingStores.value = true
		try {
			const items = await configurationApi.listAllStores()
			stores.value = items
				.filter((item: Store) => item.id != null)
				.map((item: Store) => ({ label: item.name, value: item.id as number }))
		} finally {
			loadingStores.value = false
		}
	}

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listTopics({
				store_id: filters.value.store_id ?? undefined,
				limit: limit.value,
				offset: offset.value
			})
			topics.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		await Promise.all([loadStores(), load()])
	})

	const openCreate = () => {
		selectedTopic.value = null
		showTopicModal.value = true
	}

	const closeTopicModal = () => {
		showTopicModal.value = false
	}

	const editTopic = (topic: Topic) => {
		if (!topic.id) return
		router.push(`/admin-panel/content-management/topics/${topic.id}`)
	}

	const deleteTopic = (topic: Topic) => {
		selectedTopic.value = topic
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedTopic.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteTopic(selectedTopic.value.id)
			toast.success('Тема успешно удалена')
			showDeleteModal.value = false
			selectedTopic.value = null
			await load()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) {
				toast.error(msg)
			} else {
				throw err
			}
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {}
		limit.value = 15
		offset.value = 0
		await load()
	}

	const onStoreIdFilterInput = (value: string | number | null) => {
		if (value === null || value === undefined || String(value).trim() === '') {
			filters.value.store_id = undefined
			return
		}
		const n = Number(value)
		filters.value.store_id = Number.isInteger(n) && n > 0 ? n : undefined
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Topics" subtitle="Список тем и управление ими." :icon="DocsIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить тему</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<SelectField
				:model-value="filters.store_id ?? null"
				label="Магазин"
				name="store_id"
				placeholder="Все магазины"
				:disabled="loadingStores"
				:options="[{ label: 'Все магазины', value: null }, ...stores]"
				@update:model-value="onStoreIdFilterInput"
			/>

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<TopicsTable :topics="topics" :loading="loading" @edit="editTopic" @delete="deleteTopic" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<TopicCreateModal
			v-if="showTopicModal"
			:open="showTopicModal"
			:topic="null"
			@close="closeTopicModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedTopic?.title || selectedTopic?.system_name"
			entity-name="тему"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
