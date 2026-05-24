<script setup lang="ts">
	defineProps<{
		toneClass?: string
	}>()
</script>

<template>
	<span class="inline-flex rounded-xl px-2 py-0.5 w-full justify-center text-sm font-semibold" :class="toneClass">
		<slot />
	</span>
</template>
