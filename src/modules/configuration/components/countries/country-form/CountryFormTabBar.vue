<script setup lang="ts">
	import { COUNTRY_FORM_TABS, type CountryFormTab } from '../../../helpers'

	const props = defineProps<{
		statesDisabled?: boolean
	}>()

	const activeTab = defineModel<CountryFormTab>('activeTab', { required: true })

	const tabButtonClass = (tab: CountryFormTab) => {
		const active = activeTab.value === tab

		return active
			? 'border-b-2 border-blue-600 px-4 py-2 text-sm font-semibold text-blue-600 cursor-pointer'
			: 'border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 cursor-pointer'
	}

	const onTabClick = (tab: CountryFormTab) => {
		if (tab === 'states' && props.statesDisabled) return
		activeTab.value = tab
	}
</script>

<template>
	<div class="flex flex-wrap gap-1 border-b border-gray-200">
		<template v-for="tab in COUNTRY_FORM_TABS" :key="tab.id">
			<button
				v-if="tab.id !== 'states' || !props.statesDisabled"
				type="button"
				:class="tabButtonClass(tab.id)"
				@click="onTabClick(tab.id)"
			>
				{{ tab.label }}
			</button>
		</template>
	</div>
</template>
