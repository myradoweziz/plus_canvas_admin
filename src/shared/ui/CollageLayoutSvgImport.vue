<script setup lang="ts">
	import { computed, ref, watch } from 'vue'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { collageLayoutsApi } from '@/modules/products/api/collage-layouts'
	import type { CollageLayout, CollageLayoutPayload } from '@/modules/products/types'

	const props = withDefaults(
		defineProps<{
			modelValue?: number | null
			currentLayout?: CollageLayout | null
			label?: string
			description?: string
			disabled?: boolean
			errorMessage?: string
		}>(),
		{
			label: 'Импорт SVG layout',
			description: 'Загрузите SVG — имя возьмётся из файла, layout создастся автоматически.',
			disabled: false,
			errorMessage: ''
		}
	)

	const emit = defineEmits<{
		(e: 'update:modelValue', layoutId: number | null): void
		(e: 'update:currentLayout', layout: CollageLayout | null): void
		(e: 'created', layoutId: number): void
	}>()

	const displayLayout = ref<CollageLayout | null>(null)

	watch(
		() => props.currentLayout,
		(layout) => {
			if (layout?.id != null) {
				displayLayout.value = layout
			}
		},
		{ immediate: true, deep: true }
	)

	watch(
		() => props.modelValue,
		(id) => {
			if (id == null) {
				displayLayout.value = null
			}
		}
	)

	const previewLayout = computed(() => {
		const layout = displayLayout.value
		if (!layout) return null
		if (props.modelValue != null && layout.id !== props.modelValue) return null
		return layout
	})

	const fileInput = ref<HTMLInputElement | null>(null)
	const localError = ref('')
	const importing = ref(false)
	const saving = ref(false)
	const draft = ref<CollageLayoutPayload | null>(null)
	const createdLayoutId = ref<number | null>(null)

	const nameFromFile = (file: File) => {
		const withoutExt = file.name.replace(/\.[^/.]+$/, '').trim()
		return withoutExt || file.name.trim()
	}

	const saveLayout = async (): Promise<number | null> => {
		if (!draft.value || !draft.value.name.trim()) return null

		saving.value = true
		localError.value = ''

		try {
			const created = await collageLayoutsApi.createCollageLayout(draft.value)
			const layoutId = created.id
			if (layoutId == null || !Number.isFinite(layoutId)) {
				localError.value = 'Layout создан, но id не получен'
				return null
			}

			createdLayoutId.value = layoutId
			displayLayout.value = created
			draft.value = null
			emit('update:modelValue', layoutId)
			emit('update:currentLayout', created)
			emit('created', layoutId)
			return layoutId
		} catch {
			localError.value = 'Не удалось сохранить layout'
			return null
		} finally {
			saving.value = false
		}
	}

	const onPick = async (event: Event) => {
		const input = event.target as HTMLInputElement
		const file = (input.files || [])[0]
		input.value = ''
		if (!file) return

		localError.value = ''
		createdLayoutId.value = null
		draft.value = null
		importing.value = true

		try {
			const imported = await collageLayoutsApi.importCollageLayoutSvg(file)
			imported.name = nameFromFile(file)
			draft.value = imported

			importing.value = false
			const layoutId = await saveLayout()
			if (!layoutId) {
				draft.value = null
			}
		} catch {
			localError.value = 'Не удалось импортировать SVG'
			draft.value = null
		} finally {
			importing.value = false
			saving.value = false
		}
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

			<div class="flex flex-wrap items-center gap-2">
				<input ref="fileInput" type="file" accept=".svg,image/svg+xml" class="hidden" @change="onPick" />
				<Button
					type="button"
					variant="outline"
					size="sm"
					:disabled="disabled || importing || saving"
					:on-click="() => fileInput?.click()"
				>
					{{ importing || saving ? (saving ? 'Сохранение...' : 'Импорт...') : 'Выбрать SVG' }}
				</Button>
			</div>
		</div>

		<div v-if="previewLayout && !draft" class="mt-4 space-y-3">
			<div class="flex flex-col gap-3 sm:flex-row sm:items-start">
				<img
					v-if="previewLayout.image_url"
					:src="previewLayout.image_url"
					:alt="previewLayout.name"
					class="h-24 w-24 rounded-lg object-contain ring-1 ring-gray-200"
				/>
				<div class="min-w-0 text-sm text-gray-700">
					<p class="font-semibold text-gray-900">{{ previewLayout.name }}</p>
					<p class="mt-1 text-xs text-gray-500">
						id: {{ previewLayout.id }} · слотов: {{ previewLayout.layout_json?.length ?? 0 }}
					</p>
				</div>
			</div>
		</div>

		<div v-if="draft" class="mt-4 space-y-3">
			<TextField v-model="draft.name" label="Название layout *" name="collage_layout_name" placeholder="Название" />
			<div class="grid grid-cols-2 gap-3 text-sm text-gray-700 md:grid-cols-4">
				<div class="rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200">
					<p class="text-xs text-gray-500">Слотов</p>
					<p class="font-semibold">{{ draft.layout_json.length }}</p>
				</div>
				<div class="rounded-lg bg-white px-3 py-2 ring-1 ring-gray-200">
					<p class="text-xs text-gray-500">Max images</p>
					<p class="font-semibold">{{ draft.max_images }}</p>
				</div>
			</div>
			<CheckboxField v-model="draft.is_active" label="Активно" name="collage_layout_is_active" />
			<p v-if="props.modelValue ?? createdLayoutId" class="text-sm text-green-700">
				Layout создан (id: {{ props.modelValue ?? createdLayoutId }}). Привязан к продукту.
			</p>
		</div>

		<p v-if="errorMessage || localError" class="mt-2 text-xs text-red-500">{{ errorMessage || localError }}</p>
	</div>
</template>
