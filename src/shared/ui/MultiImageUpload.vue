<script setup lang="ts">
	import { computed, onBeforeUnmount, ref, watch } from 'vue'

	import Button from '@/shared/ui/Button.vue'

	const props = withDefaults(
		defineProps<{
			modelValue: Array<string | File>
			label?: string
			description?: string
			buttonText?: string
			accept?: string
			errorMessage?: string
			maxFileSizeMb?: number
			uploader?: (files: File[], onProgress: (percent: number) => void) => Promise<Array<{ path: string; url: string }>>
		}>(),
		{
			label: 'Images',
			description: 'Выберите одну или несколько картинок.',
			buttonText: 'Выбрать файлы',
			accept: 'image/*',
			maxFileSizeMb: 10
		}
	)

	const emit = defineEmits<{
		(e: 'update:modelValue', value: Array<string | File>): void
	}>()

	const fileInput = ref<HTMLInputElement | null>(null)
	const filePreviewUrls = ref<string[]>([])
	const localError = ref<string>('')
	const uploading = ref(false)
	const uploadProgress = ref(0)

	const revokePreviews = () => {
		filePreviewUrls.value.forEach((url) => URL.revokeObjectURL(url))
		filePreviewUrls.value = []
	}

	watch(
		() => props.modelValue,
		(items) => {
			revokePreviews()
			filePreviewUrls.value = items.filter((item) => item instanceof File).map((file) => URL.createObjectURL(file))
		},
		{ immediate: true }
	)

	onBeforeUnmount(revokePreviews)

	const previews = computed(() => {
		let fileIndex = 0

		return props.modelValue.map((item, index) => {
			if (item instanceof File) {
				const preview = {
					index,
					src: filePreviewUrls.value[fileIndex],
					name: item.name
				}
				fileIndex += 1
				return preview
			}

			return {
				index,
				src: item,
				name: item
			}
		})
	})

	const onPick = (event: Event) => {
		const input = event.target as HTMLInputElement
		const files = Array.from(input.files || [])
		input.value = ''

		if (!files.length) return

		const maxSizeBytes = (props.maxFileSizeMb || 10) * 1024 * 1024
		const acceptedFiles = files.filter((file) => file.size <= maxSizeBytes)
		const rejectedCount = files.length - acceptedFiles.length

		if (rejectedCount > 0) {
			localError.value = `Максимальный размер файла: ${props.maxFileSizeMb}MB`
		} else {
			localError.value = ''
		}

		if (!acceptedFiles.length) return
		if (!props.uploader) {
			emit('update:modelValue', [...props.modelValue, ...acceptedFiles])
			return
		}

		uploading.value = true
		uploadProgress.value = 0
		localError.value = ''

		props
			.uploader(acceptedFiles, (percent) => {
				uploadProgress.value = percent
			})
			.then((uploaded) => {
				const urls = uploaded.map((item) => item.url)
				emit('update:modelValue', [...props.modelValue, ...urls])
			})
			.catch(() => {
				localError.value = 'Не удалось загрузить файл(ы)'
			})
			.finally(() => {
				uploading.value = false
			})
	}

	const removeItem = (index: number) => {
		emit(
			'update:modelValue',
			props.modelValue.filter((_, itemIndex) => itemIndex !== index)
		)
	}
</script>

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

			<input ref="fileInput" type="file" multiple :accept="accept" class="hidden" @change="onPick" />
			<Button type="button" variant="outline" size="sm" :disabled="uploading" :on-click="() => fileInput?.click()">
				{{ uploading ? `Загрузка... ${uploadProgress}%` : buttonText }}
			</Button>
		</div>

		<div v-if="uploading" class="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
			<div
				class="h-2 rounded-full bg-blue-600 transition-[width] duration-150"
				:style="{ width: `${uploadProgress}%` }"
			></div>
		</div>

		<div v-if="previews.length" class="mt-4 grid grid-cols-1 gap-3 md:grid-cols-5">
			<div
				v-for="preview in previews"
				:key="`${preview.index}_${preview.name}`"
				class="flex items-start gap-3 rounded-lg bg-white p-3 ring-1 ring-gray-200"
			>
				<img :src="preview.src" :alt="preview.name" class="h-16 w-24 rounded-md object-cover" />

				<Button type="button" variant="ghost" size="icon" :on-click="() => removeItem(preview.index)"> ✕ </Button>
			</div>
		</div>

		<p v-if="errorMessage || localError" class="mt-2 text-xs text-red-500">{{ errorMessage || localError }}</p>
	</div>
</template>
