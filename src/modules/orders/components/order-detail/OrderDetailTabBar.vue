<script setup lang="ts">
	import { ORDER_DETAIL_TABS, type OrderDetailTab } from '../../helpers'

	const activeTab = defineModel<OrderDetailTab>('activeTab', { required: true })

	const tabButtonClass = (tab: OrderDetailTab) =>
		activeTab.value === tab
			? 'border-b-2 border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 cursor-pointer'
			: 'border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer'
</script>

<template>
	<div class="flex flex-wrap gap-1 border-b border-gray-200">
		<button
			v-for="tab in ORDER_DETAIL_TABS"
			:key="tab.id"
			type="button"
			:class="tabButtonClass(tab.id)"
			@click="activeTab = tab.id"
		>
			{{ tab.label }}
		</button>
	</div>
</template>
