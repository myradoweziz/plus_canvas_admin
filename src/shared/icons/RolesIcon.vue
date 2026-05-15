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
		<circle cx="9" cy="8" r="3" />
		<path d="M4 20v-1a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4v1" />
		<path d="M16 11l2 2 4-4" />
		<path d="M14 4h6v4" />
	</svg>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{ size?: number | string; class?: string }>(), {
		size: 20,
		class: ''
	})
</script>
