<template>
	<div
		class="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4"
		:class="{ 'border-red-500': errorMessage || localError }"
	>
		<div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
			<div class="min-w-0">
				<p class="text-sm font-semibold text-gray-900">{{ label }}</p>
				<p v-if="description" class="mt-0.5 text-xs text-gray-600">{{ description }}</p>
			</div>

			<div class="flex items-center gap-2">
				<input ref="fileInput" type="file" :accept="accept" class="hidden" @change="onPick" />
				<Button type="button" variant="outline" size="sm" :disabled="uploading" :on-click="() => fileInput?.click()">
					{{ uploading ? `Загрузка... ${uploadProgress}%` : buttonText }}
				</Button>
				<Button
					v-if="modelValue || currentUrl"
					type="button"
					variant="ghost"
					size="sm"
					:disabled="uploading"
					:on-click="clear"
				>
					{{ clearText }}
				</Button>
			</div>
		</div>

		<div v-if="uploading" class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
			<div class="h-2 rounded-full bg-blue-600 transition-[width] duration-150" :style="{ width: `${uploadProgress}%` }"></div>
		</div>

		<div v-if="previewSrc" class="mt-4 flex items-start gap-4">
			<img :src="previewSrc" :alt="previewAlt || label" class="h-16 w-24 rounded-lg object-cover ring-1 ring-gray-200" />
		</div>

		<p v-if="errorMessage || localError" class="mt-2 text-xs text-red-500">{{ errorMessage || localError }}</p>
	</div>
</template>

<script setup lang="ts">
	import { computed, onBeforeUnmount, ref, watch } from 'vue'

	import Button from '@/shared/ui/Button.vue'

	const props = withDefaults(
		defineProps<{
			modelValue: string
			currentUrl?: string
			label?: string
			description?: string
			buttonText?: string
			clearText?: string
			accept?: string
			errorMessage?: string
			maxFileSizeMb?: number
			previewAlt?: string
			uploader: (files: File[], onProgress: (percent: number) => void) => Promise<Array<{ path: string; url: string }>>
		}>(),
		{
			currentUrl: '',
			label: 'Image',
			description: '',
			buttonText: 'Выбрать файл',
			clearText: 'Очистить',
			accept: 'image/*',
			errorMessage: '',
			maxFileSizeMb: 10,
			previewAlt: ''
		}
	)

	const emit = defineEmits<{
		(e: 'update:modelValue', value: string): void
	}>()

	const fileInput = ref<HTMLInputElement | null>(null)
	const localError = ref<string>('')
	const uploading = ref(false)
	const uploadProgress = ref(0)
	const localPreviewUrl = ref<string>('')

	const revokePreview = () => {
		if (localPreviewUrl.value) URL.revokeObjectURL(localPreviewUrl.value)
		localPreviewUrl.value = ''
	}

	watch(
		() => props.modelValue,
		() => {
			// если уже получили url, локальный preview больше не нужен
			revokePreview()
		}
	)

	onBeforeUnmount(revokePreview)

	const previewSrc = computed(() => {
		return props.modelValue || localPreviewUrl.value || props.currentUrl || ''
	})

	const onPick = (event: Event) => {
		const input = event.target as HTMLInputElement
		const file = (input.files || [])[0]
		input.value = ''

		if (!file) return

		const maxSizeBytes = (props.maxFileSizeMb || 10) * 1024 * 1024
		if (file.size > maxSizeBytes) {
			localError.value = `Максимальный размер файла: ${props.maxFileSizeMb}MB`
			return
		}

		localError.value = ''
		revokePreview()
		localPreviewUrl.value = URL.createObjectURL(file)

		uploading.value = true
		uploadProgress.value = 0

		props
			.uploader([file], (percent) => {
				uploadProgress.value = percent
			})
			.then((uploaded) => {
				const url = uploaded?.[0]?.url
				if (url) emit('update:modelValue', url)
				else localError.value = 'Не удалось загрузить файл'
			})
			.catch(() => {
				localError.value = 'Не удалось загрузить файл'
			})
			.finally(() => {
				uploading.value = false
			})
	}

	const clear = () => {
		revokePreview()
		localError.value = ''
		emit('update:modelValue', '')
	}
</script>

