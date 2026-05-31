<script setup lang="ts">
	import { useAttrs } from 'vue'

	defineOptions({
		inheritAttrs: false
	})

	const attrs = useAttrs()

	const props = withDefaults(
		defineProps<{
			label?: string
			name: string
			placeholder?: string
			modelValue?: string | number
			required?: boolean
			modelModifiers?: {
				trim?: boolean
				number?: boolean
			}
			type?: string
			errorMessage?: string
			appendIcon?: object
			prependIcon?: object
		}>(),
		{
			type: 'text',
			modelValue: '',
			required: false
		}
	)

	const emit = defineEmits(['update:modelValue', 'togglePrependIcon', 'toggleAppendIcon'])

	const changeInput = (e: Event) => {
		const inputValue = (e.target as HTMLInputElement).value
		const trimmedValue = props.modelModifiers?.trim ? inputValue.trim() : inputValue
		const value = props.modelModifiers?.number && trimmedValue !== '' ? Number(trimmedValue) : trimmedValue

		emit('update:modelValue', value)
	}

	const toggleAppendIcon = () => {
		emit('toggleAppendIcon')
	}

	const togglePrependIcon = () => {
		emit('togglePrependIcon')
	}
</script>

<template>
	<div>
		<label v-if="label" class="mb-1.5 block text-sm font-medium text-gray-700">
			{{ label }} <span v-if="required" class="text-red-500">*</span>
		</label>
		<div class="relative">
			<component :is="appendIcon" class="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2" />

			<input
				:value="modelValue"
				@input="changeInput"
				:placeholder="placeholder"
				:name="name"
				:type="type"
				v-bind="attrs"
				:class="[
					'h-12 w-full outline-none rounded-xl border bg-white py-3 text-sm transition-all duration-300 shadow-sm',
					appendIcon ? 'pl-10' : 'pl-4',
					prependIcon ? 'pr-10' : 'pr-4',
					errorMessage
						? 'border-red-500 focus:border-red-600 focus:ring-4 focus:ring-red-100 text-red-600 placeholder:text-red-300'
						: 'border-gray-200 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-gray-900'
				]"
			/>
			<component
				@click="togglePrependIcon"
				:is="prependIcon"
				class="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer"
			/>
			<p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped></style>
