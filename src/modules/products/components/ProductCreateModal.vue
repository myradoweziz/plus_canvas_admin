<script setup lang="ts">
	import { computed, defineAsyncComponent, nextTick, onMounted, ref, watch } from 'vue'

	import { useRoute, useRouter } from 'vue-router'

	import Button from '@/shared/ui/Button.vue'
	import ProductFormTabBar from './product-form/ProductFormTabBar.vue'
	import ProductInfoTab from './product-form/ProductInfoTab.vue'
	const ProductDiscountTab = defineAsyncComponent(() => import('./product-form/ProductDiscountTab.vue'))
	const ProductSeoTab = defineAsyncComponent(() => import('./product-form/ProductSeoTab.vue'))
	const ProductCategoryMappingsTab = defineAsyncComponent(() => import('./product-form/ProductCategoryMappingsTab.vue'))
	const ProductTagsTab = defineAsyncComponent(() => import('./product-form/ProductTagsTab.vue'))
	const ProductCommentsTab = defineAsyncComponent(() => import('./product-form/ProductCommentsTab.vue'))
	const ProductOrdersTab = defineAsyncComponent(() => import('./product-form/ProductOrdersTab.vue'))

	import { api } from '../api'
	import { createEmptyCanvasProduct, uploadImageCountFromLayout, type ProductFormTab } from '../helpers'
	import type { CanvasProduct } from '../types'

	const route = useRoute()
	const router = useRouter()

	const activeTab = ref<ProductFormTab>('productInfo')

	const form = ref<CanvasProduct>(createEmptyCanvasProduct())

	const productInfoTabRef = ref<InstanceType<typeof ProductInfoTab> | null>(null)

	const mountedTabs = ref<Set<ProductFormTab>>(new Set(['productInfo']))

	const productId = computed(() => {
		const id = Number(route.params.id)

		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => productId.value != null)

	const effectiveProductId = computed(() => form.value.id ?? productId.value)

	const pageTitle = computed(() => (isEditMode.value ? 'Редактировать продукт' : 'Добавить продукт'))

	const isTabMounted = (tab: ProductFormTab) => mountedTabs.value.has(tab)

	watch(activeTab, (tab) => {
		mountedTabs.value = new Set([...mountedTabs.value, tab])
	})

	const normalizeLoadedProduct = (product: CanvasProduct): CanvasProduct => ({
		...createEmptyCanvasProduct(),

		...product,

		main_category_slug:
			product.main_category_slug ?? (product as { main_category?: { slug?: string } }).main_category?.slug ?? '',

		collage_layout_id: product.collage_layout_id ?? product.collage_layout?.id ?? null,

		collage_layout: product.collage_layout ?? null,

		upload_image_count: product.collage_layout
			? uploadImageCountFromLayout(product.collage_layout) || product.upload_image_count
			: product.upload_image_count
	})

	const loadProduct = async () => {
		if (!productId.value) return

		const product = await api.getCanvasProduct(productId.value)

		form.value = normalizeLoadedProduct(product)

		await nextTick()

		productInfoTabRef.value?.syncCategoryCascade()
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

			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				<ProductFormTabBar v-model:active-tab="activeTab" />

				<ProductInfoTab
					v-show="activeTab === 'productInfo'"
					v-if="isTabMounted('productInfo')"
					ref="productInfoTabRef"
					v-model:form="form"
					:product-id="effectiveProductId"
					@created="onProductCreated"
				/>

				<ProductDiscountTab
					v-show="activeTab === 'discount'"
					v-if="isTabMounted('discount')"
					v-model:product-discount="form.product_discount"
					:product-id="effectiveProductId"
				/>

				<ProductSeoTab
					v-show="activeTab === 'seo'"
					v-if="isTabMounted('seo')"
					v-model:seo="form.seo"
					:product-id="effectiveProductId"
					:product-name="form.name"
				/>

				<ProductCategoryMappingsTab
					v-show="activeTab === 'categoryMappings'"
					v-if="isTabMounted('categoryMappings')"
					v-model:category-mappings="form.category_mappings"
					:product-id="effectiveProductId"
				/>

				<ProductTagsTab v-show="activeTab === 'productTags'" v-if="isTabMounted('productTags')" v-model:form="form" />

				<ProductCommentsTab
					v-show="activeTab === 'productComments'"
					v-if="isTabMounted('productComments')"
					:product-id="effectiveProductId"
				/>

				<ProductOrdersTab
					v-show="activeTab === 'productOrders'"
					v-if="isTabMounted('productOrders')"
					:product-id="effectiveProductId"
				/>
			</div>
		</div>
	</div>
</template>
