<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import CanvasFramesTable from '../components/CanvasFramesTable.vue'
	const CanvasFrameCreateModal = defineAsyncComponent(() => import('../components/CanvasFrameCreateModal.vue'))

	import { CanvasFormatsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { CanvasFrame } from '../types'

	const loading = ref(false)
	const frames = ref<CanvasFrame[]>([])
	const showModal = ref(false)
	const selectedFrame = ref<CanvasFrame | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({ search: '' })

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listCanvasFrames({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			frames.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedFrame.value = null
		showModal.value = true
	}

	const closeModal = () => {
		showModal.value = false
		selectedFrame.value = null
	}

	const editFrame = (frame: CanvasFrame) => {
		selectedFrame.value = frame
		showModal.value = true
	}

	const deleteFrame = (frame: CanvasFrame) => {
		selectedFrame.value = frame
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedFrame.value?.id) return
		loadingDeleteModal.value = true
		try {
			await api.deleteCanvasFrame(selectedFrame.value.id)
			showDeleteModal.value = false
			selectedFrame.value = null
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
		limit.value = 10
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Рамки" subtitle="Список canvas frames и управление ими." :icon="CanvasFormatsIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить рамку</Button>
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

		<CanvasFramesTable :frames="frames" :loading="loading" @edit="editFrame" @delete="deleteFrame" />
		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<CanvasFrameCreateModal
			v-if="showModal"
			:open="showModal"
			:frame="selectedFrame"
			@close="closeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedFrame?.name"
			entity-name="рамку"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
