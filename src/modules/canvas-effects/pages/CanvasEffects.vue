<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import CanvasEffectsTable from '../components/CanvasEffectsTable.vue'
	const CanvasEffectCreateModal = defineAsyncComponent(() => import('../components/CanvasEffectCreateModal.vue'))

	import { CanvasFormatsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { CanvasEffect } from '../types'

	const loading = ref(false)
	const effects = ref<CanvasEffect[]>([])
	const showModal = ref(false)
	const selectedEffect = ref<CanvasEffect | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({ search: '' })

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listCanvasEffects({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			effects.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedEffect.value = null
		showModal.value = true
	}

	const closeModal = () => {
		showModal.value = false
		selectedEffect.value = null
	}

	const editEffect = (effect: CanvasEffect) => {
		selectedEffect.value = effect
		showModal.value = true
	}

	const deleteEffect = (effect: CanvasEffect) => {
		selectedEffect.value = effect
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedEffect.value?.id) return
		loadingDeleteModal.value = true
		try {
			await api.deleteCanvasEffect(selectedEffect.value.id)
			showDeleteModal.value = false
			selectedEffect.value = null
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
		<Banner title="Эффекты" subtitle="Список canvas effects и управление ими." :icon="CanvasFormatsIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить эффект</Button>
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

		<CanvasEffectsTable :effects="effects" :loading="loading" @edit="editEffect" @delete="deleteEffect" />
		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<CanvasEffectCreateModal
			v-if="showModal"
			:open="showModal"
			:effect="selectedEffect"
			@close="closeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedEffect?.name"
			entity-name="эффект"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
