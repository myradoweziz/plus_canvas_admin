<script setup lang="ts">
	import { useAttrs } from 'vue'

	defineOptions({
		inheritAttrs: false
	})

	const attrs = useAttrs()

	const props = withDefaults(
		defineProps<{
			label: string
			name: string
			placeholder?: string
			modelValue?: string
			modelModifiers?: {
				trim?: boolean
			}
			errorMessage?: string
		}>(),
		{
			modelValue: '',
			placeholder: ''
		}
	)

	const emit = defineEmits(['update:modelValue'])

	const changeInput = (e: Event) => {
		const inputValue = (e.target as HTMLTextAreaElement).value
		const value = props.modelModifiers?.trim ? inputValue.trim() : inputValue

		emit('update:modelValue', value)
	}
</script>

<template>
	<div>
		<label class="mb-1.5 block text-sm font-medium text-gray-700">{{ label }}</label>
		<textarea
			:value="modelValue"
			@input="changeInput"
			:placeholder="placeholder"
			:name="name"
			v-bind="attrs"
			:class="[
				'min-h-28 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm shadow-sm outline-none transition-all duration-300',
				errorMessage
					? 'border-red-500 text-red-600 placeholder:text-red-300 focus:border-red-600 focus:ring-4 focus:ring-red-100'
					: 'border-gray-200 text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'
			]"
		/>
		<p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
	</div>
</template>

<style lang="scss" scoped></style>

