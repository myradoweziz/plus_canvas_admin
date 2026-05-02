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
		<path d="M4 5h16v14H4z" />
		<path d="M8 9h4" />
		<path d="M8 13h3" />
		<path d="m16 8 1 2 2 .3-1.5 1.4.4 2-1.9-1-1.9 1 .4-2L13 10.3l2-.3z" />
	</svg>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{ size?: number | string; class?: string }>(), {
		size: 20,
		class: ''
	})
</script>

