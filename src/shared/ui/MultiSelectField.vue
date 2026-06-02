<script setup lang="ts">
	type SelectOption = {
		label: string
		value: string | number
		disabled?: boolean
	}

	const props = withDefaults(
		defineProps<{
			label: string
			name: string
			modelValue?: Array<string | number>
			options: SelectOption[]
			disabled?: boolean
			errorMessage?: string
			required?: boolean
		}>(),
		{
			modelValue: () => [],
			disabled: false,
			required: false,
			errorMessage: ''
		}
	)

	const emit = defineEmits<{
		(e: 'update:modelValue', value: Array<string | number>): void
	}>()

	const onChange = (e: Event) => {
		const el = e.target as HTMLSelectElement
		const selected = Array.from(el.selectedOptions).map((o) => o.value)

		const allowed = new Map(props.options.map((o) => [String(o.value), o.value] as const))
		emit(
			'update:modelValue',
			selected.map((v) => allowed.get(String(v)) ?? v)
		)
	}
</script>

<template>
	<div>
		<label class="mb-1.5 block text-sm font-medium text-gray-700">
			{{ label }} <span v-if="required" class="text-red-500">*</span>
		</label>

		<select
			:name="name"
			multiple
			:disabled="disabled"
			:value="(modelValue ?? []).map((v) => String(v))"
			@change="onChange"
			:class="[
				'min-h-12 w-full rounded-xl border bg-white px-4 py-3 text-left text-sm transition-all duration-300 shadow-sm outline-none',
				errorMessage
					? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100'
					: 'border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10',
				disabled ? 'cursor-not-allowed bg-gray-50 text-gray-400' : 'hover:border-blue-300'
			]"
		>
			<option v-for="opt in options" :key="String(opt.value)" :value="String(opt.value)" :disabled="opt.disabled">
				{{ opt.label }}
			</option>
		</select>

		<p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
	</div>
</template>

