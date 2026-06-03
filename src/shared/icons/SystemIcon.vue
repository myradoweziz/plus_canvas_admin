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
		<rect x="2" y="3" width="20" height="14" rx="2" />
		<path d="M8 21h8" />
		<path d="M12 17v4" />
		<path d="M7 8h.01" />
		<path d="M12 8h.01" />
	</svg>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{ size?: number | string; class?: string }>(), {
		size: 20,
		class: ''
	})
</script>
