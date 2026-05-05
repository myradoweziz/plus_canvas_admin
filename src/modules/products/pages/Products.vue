<script setup lang="ts">
	import { onMounted, ref } from 'vue'
	import { useRouter } from 'vue-router'

	import { BoxCubeIcon } from '@/shared/icons'
	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import { canvasProductsApi } from '../api/products'
	import ProductsTable from '../components/ProductsTable.vue'
	import type { CanvasProduct } from '../types/product'

	const router = useRouter()
	const loading = ref(false)
	const products = ref<CanvasProduct[]>([])
	const selectedProduct = ref<CanvasProduct | null>(null)
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
			const result = await canvasProductsApi.listCanvasProducts({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			products.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		router.push('/products/create')
	}

	const editProduct = (product: CanvasProduct) => {
		if (!product.id) return
		router.push(`/products/${product.id}/edit`)
	}

	const deleteProduct = (product: CanvasProduct) => {
		selectedProduct.value = product
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedProduct.value?.id) return

		loadingDeleteModal.value = true
		try {
			await canvasProductsApi.deleteCanvasProduct(selectedProduct.value.id)
			showDeleteModal.value = false
			selectedProduct.value = null
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
		<Banner title="Продукты" subtitle="Список canvas products и управление ими." :icon="BoxCubeIcon">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить продукт</Button>
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

		<ProductsTable :products="products" :loading="loading" @edit="editProduct" @delete="deleteProduct" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedProduct?.name"
			entity-name="продукт"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
