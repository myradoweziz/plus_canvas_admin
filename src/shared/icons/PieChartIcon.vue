<template>
	<svg
		xmlns="http://www.w3.org/2000/svg"
		:width="props.size"
		:height="props.size"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
		stroke-linejoin="round"
		:class="props.class"
		aria-hidden="true"
	>
		<path d="M21 12a9 9 0 1 1-9-9v9z" />
		<path d="M12 3a9 9 0 0 1 9 9h-9z" />
	</svg>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{ size?: number | string; class?: string }>(), {
		size: 20,
		class: ''
	})
</script>

