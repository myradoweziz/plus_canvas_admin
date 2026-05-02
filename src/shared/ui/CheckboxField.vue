<script setup lang="ts">
	defineProps<{
		label: string
		name: string
		modelValue: boolean
		disabled?: boolean
	}>()

	const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void }>()

	const updateValue = (event: Event) => {
		emit('update:modelValue', (event.target as HTMLInputElement).checked)
	}
</script>

<template>
	<label class="flex items-center gap-2">
		<input
			:checked="modelValue"
			:name="name"
			type="checkbox"
			class="h-4 w-4"
			:disabled="disabled"
			@change="updateValue"
		/>
		<span class="text-sm text-gray-700">{{ label }}</span>
	</label>
</template>
