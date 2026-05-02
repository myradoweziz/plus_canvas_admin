<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { slugify } from '@/shared'
	import { categoriesApi } from '../../api'
	import type { MainCategory } from '../../types/category'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; category: MainCategory | null }>()

	const saving = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')
	const categoryTypeOptions = [
		{ label: 'Kişiye Özel Kanvas', value: 'Kişiye Özel Kanvas ' },
		{ label: 'Tablo Kanvas Tablo Galerisi', value: 'Tablo  Kanvas Tablo Galerisi' }
	]

	const form = ref<MainCategory>({
		id: null,
		name: '',
		slug: '',
		is_active: false,
		featured_order: 0,
		category_type: 'Kişiye Özel Kanvas '
	})

	const resetForm = () => {
		form.value = {
			id: null,
			name: '',
			slug: '',
			is_active: false,
			featured_order: 0,
			category_type: 'Kişiye Özel Kanvas '
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
				name: category.name,
				slug: category.slug,
				is_active: category.is_active,
				featured_order: category.featured_order,
				category_type: category.category_type
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

	const onSlugInput = (value: string | number) => {
		form.value.slug = String(value)
		slugManuallyEdited.value = form.value.slug !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.category?.id) {
				await categoriesApi.updateMainCategory(form.value)
			} else {
				await categoriesApi.createMainCategory(form.value)
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
						{{ props.category ? 'Редактировать главную категорию' : 'Добавить главную категорию' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
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

				<div class="md:col-span-1">
					<SelectField
						v-model="form.category_type"
						label="Category Type *"
						name="category_type"
						placeholder="Select category type"
						:options="categoryTypeOptions"
					/>
				</div>

				<CheckboxField v-model="form.is_active" label="Active" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || !form.name || !form.category_type" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
