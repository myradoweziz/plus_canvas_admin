<script setup lang="ts">
	import { computed } from 'vue'

	const props = withDefaults(
		defineProps<{
			label: string
			name: string
			modelValue?: string
			errorMessage?: string
			required?: boolean
		}>(),
		{
			modelValue: '#000000',
			required: false
		}
	)

	const emit = defineEmits<{ (e: 'update:modelValue', value: string): void }>()

	const normalizedValue = computed(() => {
		const value = props.modelValue || '#000000'
		return value.startsWith('#') ? value : `#${value}`
	})

	const updateValue = (value: string) => {
		const normalized = value.startsWith('#') ? value : `#${value}`
		emit('update:modelValue', normalized.toUpperCase())
	}
</script>

<template>
	<div>
		<label class="mb-1.5 block text-sm font-medium text-gray-700">
			{{ label }} <span v-if="required" class="text-red-500">*</span>
		</label>
		<div class="flex h-12 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10">
			<input
				:value="normalizedValue"
				:name="name"
				type="color"
				class="h-8 w-10 cursor-pointer rounded-md border-0 bg-transparent p-0"
				@input="updateValue(($event.target as HTMLInputElement).value)"
			/>
			<input
				:value="normalizedValue"
				type="text"
				class="h-full min-w-0 flex-1 bg-transparent text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400"
				placeholder="#000000"
				maxlength="7"
				@input="updateValue(($event.target as HTMLInputElement).value)"
			/>
		</div>
		<p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
	</div>
</template>

