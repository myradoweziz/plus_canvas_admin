<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import { BrandsIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { brandsApi } from '../api/brands'
	import BrandCreateModal from '../components/BrandCreateModal.vue'
	import BrandsTable from '../components/BrandsTable.vue'
	import type { Brand } from '../types/brand'

	const loading = ref(false)
	const brands = ref<Brand[]>([])
	const showBrandModal = ref(false)
	const selectedBrand = ref<Brand | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		name: '',
		featured_order: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await brandsApi.listBrands({
				name: filters.value.name,
				featured_order: filters.value.featured_order === '' ? undefined : Number(filters.value.featured_order),
				limit: limit.value,
				offset: offset.value
			})
			brands.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedBrand.value = null
		showBrandModal.value = true
	}

	const closeBrandModal = () => {
		showBrandModal.value = false
		selectedBrand.value = null
	}

	const editBrand = (brand: Brand) => {
		selectedBrand.value = brand
		showBrandModal.value = true
	}

	const deleteBrand = (brand: Brand) => {
		selectedBrand.value = brand
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedBrand.value?.id) return

		loadingDeleteModal.value = true
		try {
			await brandsApi.deleteBrand(selectedBrand.value.id)
			showDeleteModal.value = false
			selectedBrand.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderBrands = async (orderedBrands: Brand[]) => {
		brands.value = orderedBrands
		await brandsApi.reorderBrands({
			items: orderedBrands
				.filter((brand): brand is Brand & { id: number } => brand.id !== null)
				.map((brand) => ({
					id: brand.id,
					featured_order: brand.featured_order
				}))
		})
		await load()
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			name: '',
			featured_order: ''
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
		<Banner title="Бренды" subtitle="Список брендов и управление ими." :icon="BrandsIcon">
			<template #actions>
				<button
					type="button"
					class="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
					@click="openCreate"
				>
					Добавить бренд
				</button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.name" label="Name" name="name" placeholder="Name" />
			<TextField v-model="filters.featured_order" label="Featured Order" name="featured_order" type="number" min="0" />

			<div class="flex items-end gap-2">
				<button
					type="submit"
					class="h-12 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
				>
					Фильтр
				</button>
				<button
					type="button"
					class="h-12 rounded-xl px-4 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50"
					@click="resetFilters"
				>
					Сброс
				</button>
			</div>
		</form>

		<BrandsTable :brands="brands" :loading="loading" @edit="editBrand" @delete="deleteBrand" @reorder="reorderBrands" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<BrandCreateModal :open="showBrandModal" :brand="selectedBrand" @close="closeBrandModal" @saved="load" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedBrand?.name"
			entity-name="бренд"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
