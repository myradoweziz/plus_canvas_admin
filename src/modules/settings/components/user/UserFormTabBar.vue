<script setup lang="ts">
	import type { UserFormTab, UserFormTabItem } from '../../helpers/user-form'

	defineProps<{
		tabs: UserFormTabItem[]
	}>()

	const activeTab = defineModel<UserFormTab>('activeTab', { required: true })

	const tabButtonClass = (tab: UserFormTab) =>
		activeTab.value === tab
			? 'border-b-2 border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 cursor-pointer'
			: 'border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer'
</script>

<template>
	<div class="mt-6 flex flex-wrap gap-1 border-b border-gray-200">
		<button v-for="tab in tabs" :key="tab.id" type="button" :class="tabButtonClass(tab.id)" @click="activeTab = tab.id">
			{{ tab.label }}
		</button>
	</div>
</template>
