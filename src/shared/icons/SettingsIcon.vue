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
		<path
			d="M12 15.5a3.5 3.5 0 1 0-3.5-3.5 3.5 3.5 0 0 0 3.5 3.5zm8.94-2.5a7.86 7.86 0 0 0 .06-1 7.86 7.86 0 0 0-.06-1l2.12-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.28 7.28 0 0 0-1.73-1l-.38-2.65A.5.5 0 0 0 15.5 1h-4a.5.5 0 0 0-.5.42l-.38 2.65a7.28 7.28 0 0 0-1.73 1l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64L5.06 10a7.86 7.86 0 0 0-.06 1 7.86 7.86 0 0 0 .06 1l-2.12 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1a7.28 7.28 0 0 0 1.73 1l.38 2.65a.5.5 0 0 0 .5.42h4a.5.5 0 0 0 .5-.42l.38-2.65a7.28 7.28 0 0 0 1.73-1l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64z"
		/>
	</svg>
</template>

<script setup lang="ts">
	const props = withDefaults(defineProps<{ size?: number | string; class?: string }>(), {
		size: 20,
		class: ''
	})
</script>

