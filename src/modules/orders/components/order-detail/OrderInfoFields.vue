<script setup lang="ts">
	defineProps<{
		title: string
		fields: Array<{ label: string; value: string }>
	}>()
</script>

<template>
	<section class="space-y-3">
		<h4 class="text-sm font-semibold text-gray-900">{{ title }}</h4>
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
			<div v-for="field in fields" :key="field.label">
				<p class="text-xs font-medium uppercase tracking-wide text-gray-500">{{ field.label }}</p>
				<p class="mt-1 text-sm text-gray-900">{{ field.value }}</p>
			</div>
		</div>
	</section>
</template>
