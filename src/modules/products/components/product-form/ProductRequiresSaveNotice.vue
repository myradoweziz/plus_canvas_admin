<script setup lang="ts">
	withDefaults(
		defineProps<{
			suffix?: string
		}>(),
		{
			suffix: ''
		}
	)
</script>

<template>
	<div class="md:col-span-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
		Сначала сохраните продукт на вкладке <strong>Product Info</strong>{{ suffix }}.
	</div>
</template>
