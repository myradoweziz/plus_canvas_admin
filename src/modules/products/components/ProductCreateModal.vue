<script setup lang="ts">
	import { computed, nextTick, onMounted, ref } from 'vue'
	import { useRoute, useRouter } from 'vue-router'

	import Button from '@/shared/ui/Button.vue'
	import ProductFormTabBar from './product-form/ProductFormTabBar.vue'
	import ProductInfoTab from './product-form/ProductInfoTab.vue'
	import ProductSeoTab from './product-form/ProductSeoTab.vue'

	import { api } from '../api'
	import { createEmptyCanvasProduct, type ProductFormTab } from '../helpers/product-form'
	import type { CanvasProduct } from '../types/product'

	const route = useRoute()
	const router = useRouter()

	const activeTab = ref<ProductFormTab>('productInfo')
	const form = ref<CanvasProduct>(createEmptyCanvasProduct())
	const productInfoTabRef = ref<InstanceType<typeof ProductInfoTab> | null>(null)

	const productId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => productId.value != null)
	const effectiveProductId = computed(() => form.value.id ?? productId.value)

	const pageTitle = computed(() => (isEditMode.value ? 'Редактировать продукт' : 'Добавить продукт'))

	const loadProduct = async () => {
		if (!productId.value) return

		const product = await api.getCanvasProduct(productId.value)
		form.value = {
			...createEmptyCanvasProduct(),
			...product
		}
		await nextTick()
		productInfoTabRef.value?.applyLoadedProduct(product)
	}

	const onProductCreated = async (id: number) => {
		form.value.id = id
		await router.replace(`/admin-panel/products/${id}/edit`)
		activeTab.value = 'seo'
	}

	onMounted(async () => {
		if (productId.value) {
			await loadProduct()
		}
	})
</script>

<template>
	<div class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h3>
				<Button type="button" variant="outline" size="sm" :on-click="() => router.push('/admin-panel/products')">
					Назад
				</Button>
			</div>

			<div class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
				<ProductFormTabBar v-model:active-tab="activeTab" />

				<ProductInfoTab
					v-if="activeTab === 'productInfo'"
					ref="productInfoTabRef"
					v-model:form="form"
					:product-id="effectiveProductId"
					@created="onProductCreated"
				/>

				<ProductSeoTab v-else v-model:seo="form.seo" :product-id="effectiveProductId" :product-name="form.name" />
			</div>
		</div>
	</div>
</template>
