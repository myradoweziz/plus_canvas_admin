<script setup lang="ts">
	import { PRODUCT_FORM_TABS, type ProductFormTab } from '../../helpers/product-form'

	const activeTab = defineModel<ProductFormTab>('activeTab', { required: true })

	const tabButtonClass = (tab: ProductFormTab) =>
		activeTab.value === tab
			? 'border-b-2 border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600'
			: 'border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900'
</script>

<template>
	<div class="flex gap-1 border-b border-gray-200 md:col-span-3">
		<button
			v-for="tab in PRODUCT_FORM_TABS"
			:key="tab.id"
			type="button"
			:class="tabButtonClass(tab.id)"
			@click="activeTab = tab.id"
		>
			{{ tab.label }}
		</button>
	</div>
</template>
