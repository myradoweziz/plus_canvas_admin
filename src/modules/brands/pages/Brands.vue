<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import BrandCreateModal from '../components/BrandCreateModal.vue'
	import BrandsTable from '../components/BrandsTable.vue'

	import { BrandsIcon } from '@/shared/icons'
	import { brandsApi } from '../api/brands'
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
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await brandsApi.listBrands({
				name: filters.value.search,
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
		<Banner title="Бренды" subtitle="Список брендов и управление ими." :icon="BrandsIcon">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить бренд</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Search" name="search" placeholder="Search" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
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
