<template>
	<div class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4">
		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div class="min-w-0">
				<p class="text-sm font-semibold text-gray-900">{{ label }}</p>
				<p v-if="description" class="mt-0.5 text-xs text-gray-600">{{ description }}</p>
			</div>

			<div class="flex items-center gap-2">
				<input ref="fileInput" type="file" :accept="accept" class="hidden" @change="onPick" />
				<button
					type="button"
					class="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-gray-100 disabled:opacity-60"
					@click="fileInput?.click()"
				>
					{{ buttonText }}
				</button>
				<button
					v-if="modelValue"
					type="button"
					class="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
					@click="clear"
				>
					{{ clearText }}
				</button>
			</div>
		</div>

		<div v-if="previewUrl || currentUrl" class="mt-4 flex items-start gap-4">
			<img
				:src="previewUrl || currentUrl"
				:alt="previewAlt"
				class="h-16 w-28 rounded-lg object-cover ring-1 ring-gray-200"
			/>
			<div class="min-w-0">
				<p class="text-xs font-medium text-gray-600">{{ fileLabel }}</p>
				<p class="break-all text-sm text-gray-700">{{ modelValue?.name || currentUrl }}</p>
			</div>
		</div>

		<p v-if="error" class="mt-3 text-sm text-red-600">{{ error }}</p>
	</div>
</template>

<script setup lang="ts">
	import { onBeforeUnmount, ref, watch } from 'vue'

	const props = withDefaults(
		defineProps<{
			modelValue: File | null
			currentUrl?: string
			label?: string
			description?: string
			buttonText?: string
			clearText?: string
			fileLabel?: string
			accept?: string
			previewAlt?: string
		}>(),
		{
			currentUrl: '',
			label: 'Image',
			description: 'Выберите картинку — отправим как файл при сохранении.',
			buttonText: 'Выбрать файл',
			clearText: 'Очистить',
			fileLabel: 'Файл',
			accept: 'image/*',
			previewAlt: ''
		}
	)

	const emit = defineEmits<{
		(e: 'update:modelValue', value: File | null): void
	}>()

	const fileInput = ref<HTMLInputElement | null>(null)
	const error = ref('')
	const previewUrl = ref<string>('')

	const revokePreview = () => {
		if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
		previewUrl.value = ''
	}

	watch(
		() => props.modelValue,
		(file) => {
			revokePreview()
			if (file) previewUrl.value = URL.createObjectURL(file)
		},
		{ immediate: true }
	)

	onBeforeUnmount(revokePreview)

	const onPick = (e: Event) => {
		const input = e.target as HTMLInputElement
		const file = input.files?.[0]
		input.value = ''

		if (!file) return

		error.value = ''
		emit('update:modelValue', file)
	}

	const clear = () => {
		emit('update:modelValue', null)
		error.value = ''
	}
</script>

