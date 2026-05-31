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
		<path d="M3 11v2a4 4 0 0 0 4 4h1" />
		<path d="M7 7V5a2 2 0 0 1 2-2h8.5a1 1 0 0 1 .8 1.6L16 11H7" />
		<path d="M11 11v6a2 2 0 0 0 4 0v-1" />
	</svg>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{ size?: number | string; class?: string }>(), {
		size: 20,
		class: ''
	})
</script>
