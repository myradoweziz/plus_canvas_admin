<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import FaqsTable from '../components/FaqsTable.vue'
	const FaqCreateModal = defineAsyncComponent(() => import('../components/FaqCreateModal.vue'))

	import { ChatIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Faq } from '../types'

	const loading = ref(false)
	const faqs = ref<Faq[]>([])
	const showFaqModal = ref(false)
	const selectedFaq = ref<Faq | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const loadingReorder = ref(false)
	const total = ref(0)
	const limit = ref(15)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listFaqs({
				question: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			faqs.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedFaq.value = null
		showFaqModal.value = true
	}

	const closeFaqModal = () => {
		showFaqModal.value = false
		selectedFaq.value = null
	}

	const editFaq = (faq: Faq) => {
		selectedFaq.value = faq
		showFaqModal.value = true
	}

	const deleteFaq = (faq: Faq) => {
		selectedFaq.value = faq
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedFaq.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteFaq(selectedFaq.value.id)
			showDeleteModal.value = false
			selectedFaq.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = { search: '' }
		limit.value = 15
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const reorderFaqs = async (rows: Faq[]) => {
		if (loadingReorder.value) return
		loadingReorder.value = true
		toast.info('Порядок изменён. Сохраняю...')
		try {
			// optimistic UI
			faqs.value = rows

			for (const row of rows) {
				if (!row.id) continue
				await api.updateFaq(row)
			}
			toast.success('Порядок сохранён')
		} catch (e) {
			toast.error('Не удалось сохранить порядок')
			await load()
		} finally {
			loadingReorder.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="FAQ" subtitle="Список FAQ и управление ими." :icon="ChatIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить FAQ</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Поиск" name="search" placeholder="Поиск" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<FaqsTable
			:faqs="faqs"
			:loading="loading || loadingReorder"
			@edit="editFaq"
			@delete="deleteFaq"
			@reorder="reorderFaqs"
			:pagination="{ limit, offset }"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<FaqCreateModal v-if="showFaqModal" :open="showFaqModal" :faq="selectedFaq" @close="closeFaqModal" @saved="load" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedFaq?.question"
			entity-name="FAQ"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
