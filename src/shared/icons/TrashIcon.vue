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
		<path d="M3 6h18" />
		<path d="M8 6V4h8v2" />
		<path d="M6 6l1 16h10l1-16" />
		<path d="M10 11v6" />
		<path d="M14 11v6" />
	</svg>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{ size?: number | string; class?: string }>(), {
		size: 18,
		class: ''
	})
</script>

