<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import { BrandsIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'

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

	const load = async () => {
		loading.value = true
		try {
			brands.value = await brandsApi.listBrands()
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

		<BrandsTable :brands="brands" :loading="loading" @edit="editBrand" @delete="deleteBrand" @reorder="reorderBrands" />

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
