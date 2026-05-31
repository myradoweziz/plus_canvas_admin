<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import NewsletterSubscribersTable from '../components/NewsletterSubscribersTable.vue'

	const NewsletterSubscriberEditModal = defineAsyncComponent(
		() => import('../components/NewsletterSubscriberEditModal.vue')
	)

	import { PromotionsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { NewsletterSubscriber } from '../types'

	const loading = ref(false)
	const subscribers = ref<NewsletterSubscriber[]>([])
	const selectedSubscriber = ref<NewsletterSubscriber | null>(null)
	const showEditModal = ref(false)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const exporting = ref(false)
	const importing = ref(false)
	const fileInput = ref<HTMLInputElement | null>(null)
	const total = ref(0)
	const limit = ref(15)
	const offset = ref(0)
	const filters = ref({
		email: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listNewsletterSubscribers({
				email: filters.value.email || undefined,
				limit: limit.value,
				offset: offset.value
			})
			subscribers.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const editSubscriber = (subscriber: NewsletterSubscriber) => {
		selectedSubscriber.value = subscriber
		showEditModal.value = true
	}

	const closeEditModal = () => {
		showEditModal.value = false
		selectedSubscriber.value = null
	}

	const deleteSubscriber = (subscriber: NewsletterSubscriber) => {
		selectedSubscriber.value = subscriber
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedSubscriber.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteNewsletterSubscriber(selectedSubscriber.value.id)
			showDeleteModal.value = false
			selectedSubscriber.value = null
			await load()
			toast.success('Подписчик удалён')
		} catch {
			toast.error('Не удалось удалить подписчика')
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = { email: '' }
		limit.value = 15
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const exportCsv = async () => {
		exporting.value = true
		try {
			await api.exportNewsletterSubscribersCsv()
			toast.success('CSV файл скачан')
		} catch {
			toast.error('Не удалось экспортировать CSV')
		} finally {
			exporting.value = false
		}
	}

	const triggerImportCsv = () => {
		fileInput.value?.click()
	}

	const importCsv = async (event: Event) => {
		const target = event.target as HTMLInputElement
		if (!target.files?.length) return

		importing.value = true
		try {
			await api.importNewsletterSubscribersCsv(target.files[0])
			toast.success('CSV файл успешно импортирован')
			await load()
		} catch {
			toast.error('Не удалось импортировать CSV')
		} finally {
			importing.value = false
			if (fileInput.value) {
				fileInput.value.value = ''
			}
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Подписчики рассылки"
			subtitle="Список email-подписчиков newsletter."
			:icon="PromotionsIcon"
			:total="total"
		>
			<template #actions>
				<div class="flex flex-wrap items-center gap-2">
					<Button type="button" size="sm" variant="outline" :loading="exporting" :on-click="exportCsv">
						Экспорт CSV
					</Button>
					<Button type="button" size="sm" variant="outline" :loading="importing" :on-click="triggerImportCsv">
						Импорт CSV
					</Button>
					<input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="importCsv" />
				</div>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.email" label="Email" name="email" placeholder="Email" />

			<div class="flex items-end gap-2 md:col-span-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<NewsletterSubscribersTable
			:subscribers="subscribers"
			:loading="loading"
			:pagination="{ limit, offset }"
			@edit="editSubscriber"
			@delete="deleteSubscriber"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<NewsletterSubscriberEditModal
			v-if="showEditModal"
			:open="showEditModal"
			:subscriber="selectedSubscriber"
			@close="closeEditModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedSubscriber?.email"
			entity-name="подписчика"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
