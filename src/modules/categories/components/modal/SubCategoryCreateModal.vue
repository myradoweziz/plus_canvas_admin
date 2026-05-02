<script setup lang="ts">
	import { computed, onBeforeUnmount, ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { debounce, slugify } from '@/shared'
	import { categoriesApi } from '../../api'
	import type { FeaturedCategory, SubCategory } from '../../types/category'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; category: SubCategory | null }>()

	const saving = ref(false)
	const loadingFeaturedCategories = ref(false)
	const featuredCategories = ref<FeaturedCategory[]>([])
	const featuredCategoriesRequestId = ref(0)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const form = ref<SubCategory>({
		id: null,
		category_id: null,
		name: '',
		slug: '',
		is_active: false,
		featured_order: 0
	})

	const resetForm = () => {
		form.value = {
			id: null,
			category_id: null,
			name: '',
			slug: '',
			is_active: false,
			featured_order: 0
		}
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
				category_id: category.category_id,
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

	const featuredCategoryOptions = computed(() =>
		featuredCategories.value
			.filter((category): category is FeaturedCategory & { id: number } => category.id !== null)
			.map((category) => ({
				label: category.name,
				value: category.id
			}))
	)

	const loadFeaturedCategories = async (name = '') => {
		const requestId = featuredCategoriesRequestId.value + 1
		featuredCategoriesRequestId.value = requestId
		loadingFeaturedCategories.value = true
		try {
			const result = await categoriesApi.listFeaturedCategories({
				name: name || undefined,
				limit: 100,
				offset: 0
			})

			if (requestId !== featuredCategoriesRequestId.value) return
			featuredCategories.value = result.items || []
		} finally {
			if (requestId === featuredCategoriesRequestId.value) {
				loadingFeaturedCategories.value = false
			}
		}
	}

	const searchFeaturedCategories = debounce((name: string) => {
		loadFeaturedCategories(name)
	}, 300)

	watch(
		() => props.open,
		(open) => {
			if (!open) {
				searchFeaturedCategories.cancel()
				return
			}

			loadFeaturedCategories()
		},
		{ immediate: true }
	)

	onBeforeUnmount(searchFeaturedCategories.cancel)

	const onSlugInput = (value: string | number) => {
		form.value.slug = String(value)
		slugManuallyEdited.value = form.value.slug !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.category?.id) {
				await categoriesApi.updateSubCategory(form.value)
			} else {
				await categoriesApi.createSubCategory(form.value)
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
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<SelectField
						v-model="form.category_id"
						label="Featured Category *"
						name="category_id"
						placeholder="Select featured category"
						:options="featuredCategoryOptions"
						:disabled="loadingFeaturedCategories"
						remote-search
						@search="searchFeaturedCategories"
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

				<CheckboxField v-model="form.is_active" label="Active" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || !form.name || !form.category_id" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
