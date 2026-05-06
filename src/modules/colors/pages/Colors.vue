<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import ColorCreateModal from '../components/ColorCreateModal.vue'
	import ColorsTable from '../components/ColorsTable.vue'

	import { ColorsIcon } from '@/shared/icons'
	import { colorsApi } from '../api/colors'
	import type { Color } from '../types/color'

	const loading = ref(false)
	const colors = ref<Color[]>([])
	const showColorModal = ref(false)
	const selectedColor = ref<Color | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await colorsApi.listColors({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			colors.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedColor.value = null
		showColorModal.value = true
	}

	const closeColorModal = () => {
		showColorModal.value = false
		selectedColor.value = null
	}

	const editColor = (color: Color) => {
		selectedColor.value = color
		showColorModal.value = true
	}

	const deleteColor = (color: Color) => {
		selectedColor.value = color
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedColor.value?.id) return

		loadingDeleteModal.value = true
		try {
			await colorsApi.deleteColor(selectedColor.value.id)
			showDeleteModal.value = false
			selectedColor.value = null
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
		filters.value = {
			search: ''
		}
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
		<Banner title="Цвета" subtitle="Список цветов и управление ими." :icon="ColorsIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить цвет</Button>
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

		<ColorsTable :colors="colors" :loading="loading" @edit="editColor" @delete="deleteColor" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<ColorCreateModal :open="showColorModal" :color="selectedColor" @close="closeColorModal" @saved="load" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedColor?.name"
			entity-name="цвет"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
