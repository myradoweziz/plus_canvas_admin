<script setup lang="ts">
	import { computed, onBeforeUnmount, ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { debounce } from '@/shared'
	import { categoriesApi } from '../api'
	import type { FeaturedCategory, MainCategory } from '../types/category'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; category: FeaturedCategory | null }>()

	const saving = ref(false)
	const loadingMainCategories = ref(false)
	const mainCategories = ref<MainCategory[]>([])
	const mainCategoriesRequestId = ref(0)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const form = ref<FeaturedCategory>({
		id: null,
		main_category_id: null,
		name: '',
		slug: '',
		is_active: false,
		featured_order: 0
	})

	const resetForm = () => {
		form.value = {
			id: null,
			main_category_id: null,
			name: '',
			slug: '',
			is_active: false,
			featured_order: 0
		}
	}

	const slugify = (value: string) => {
		const cyrillicMap: Record<string, string> = {
			а: 'a',
			б: 'b',
			в: 'v',
			г: 'g',
			д: 'd',
			е: 'e',
			ё: 'yo',
			ж: 'zh',
			з: 'z',
			и: 'i',
			й: 'y',
			к: 'k',
			л: 'l',
			м: 'm',
			н: 'n',
			о: 'o',
			п: 'p',
			р: 'r',
			с: 's',
			т: 't',
			у: 'u',
			ф: 'f',
			х: 'h',
			ц: 'ts',
			ч: 'ch',
			ш: 'sh',
			щ: 'sch',
			ъ: '',
			ы: 'y',
			ь: '',
			э: 'e',
			ю: 'yu',
			я: 'ya'
		}

		return value
			.toLowerCase()
			.split('')
			.map((char) => cyrillicMap[char] ?? char)
			.join('')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	watch(
		() => props.category,
		(category) => {
			if (!category) {
				resetForm()
				slugManuallyEdited.value = false
				lastGeneratedSlug.value = ''
				return
			}

			form.value = {
				id: category.id,
				main_category_id: category.main_category_id,
				name: category.name,
				slug: category.slug,
				is_active: category.is_active,
				featured_order: category.featured_order
			}
			lastGeneratedSlug.value = slugify(category.name)
			slugManuallyEdited.value = Boolean(category.slug && category.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => form.value.name,
		(name) => {
			const generatedSlug = slugify(name)

			if (!slugManuallyEdited.value || !form.value.slug || form.value.slug === lastGeneratedSlug.value) {
				form.value.slug = generatedSlug
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	const mainCategoryOptions = computed(() =>
		mainCategories.value
			.filter((category): category is MainCategory & { id: number } => category.id !== null)
			.map((category) => ({
				label: category.name,
				value: category.id
			}))
	)

	const loadMainCategories = async (name = '') => {
		const requestId = mainCategoriesRequestId.value + 1
		mainCategoriesRequestId.value = requestId
		loadingMainCategories.value = true
		try {
			const result = await categoriesApi.listMainCategories({
				name: name || undefined,
				limit: 100,
				offset: 0
			})

			if (requestId !== mainCategoriesRequestId.value) return
			mainCategories.value = result.items || []
		} finally {
			if (requestId === mainCategoriesRequestId.value) {
				loadingMainCategories.value = false
			}
		}
	}

	const searchMainCategories = debounce((name: string) => {
		loadMainCategories(name)
	}, 300)

	watch(
		() => props.open,
		(open) => {
			if (!open) {
				searchMainCategories.cancel()
				return
			}

			loadMainCategories()
		},
		{ immediate: true }
	)

	onBeforeUnmount(searchMainCategories.cancel)

	const onSlugInput = (value: string | number) => {
		form.value.slug = String(value)
		slugManuallyEdited.value = form.value.slug !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.category?.id) {
				await categoriesApi.updateFeaturedCategory(form.value)
			} else {
				await categoriesApi.createFeaturedCategory(form.value)
			}

			emit('saved')
			emit('close')

			if (!props.category) {
				resetForm()
			}
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.category ? 'Редактировать категорию' : 'Добавить категорию' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<button
					type="button"
					class="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
					@click="$emit('close')"
					aria-label="Close"
				>
					✕
				</button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<SelectField
						v-model="form.main_category_id"
						label="Main Category *"
						name="main_category_id"
						placeholder="Select main category"
						:options="mainCategoryOptions"
						:disabled="loadingMainCategories"
						remote-search
						@search="searchMainCategories"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField v-model.trim="form.name" label="Name *" name="name" placeholder="Name" />
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.trim="form.slug"
						label="Slug"
						name="slug"
						placeholder="Slug"
						@update:model-value="onSlugInput"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.featured_order"
						label="Featured Order"
						name="featured_order"
						type="number"
						min="0"
					/>
				</div>

				<div class="flex flex-col gap-3 md:col-span-2">
					<label class="flex items-center gap-2">
						<input v-model="form.is_active" type="checkbox" class="h-4 w-4" />
						<span class="text-sm text-gray-700">Active</span>
					</label>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<button
						type="button"
						class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
						@click="$emit('close')"
					>
						Отмена
					</button>
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
						:disabled="saving || !form.name || !form.main_category_id"
					>
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</button>
				</div>
			</form>
		</div>
	</Modal>
</template>
