<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { slugify } from '@/shared'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import type { Topic } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; topic: Topic | null }>()

	const saving = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')
	const activeTab = ref('general')

	const form = reactive({
		id: null as number | null,
		include_in_sitemap: false,
		include_in_top_menu: false,
		title: '',
		body: '',
		slug: '',
		meta_title: '',
		meta_description: '',
		meta_keywords: '',
	})

	const fieldErrors = reactive({
		title: '',
		body: '',
		slug: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			include_in_sitemap: false,
			include_in_top_menu: false,
			title: '',
			body: '',
			slug: '',
			meta_title: '',
			meta_description: '',
			meta_keywords: '',
		})
		fieldErrors.title = ''
		fieldErrors.body = ''
		fieldErrors.slug = ''
		activeTab.value = 'general'
	}

	const validate = () => {
		fieldErrors.title = ''
		fieldErrors.body = ''
		fieldErrors.slug = ''

		let ok = true

		if (!form.title.trim()) {
			fieldErrors.title = 'Укажите заголовок'
			ok = false
		}

		if (!form.body.trim()) {
			fieldErrors.body = 'Укажите содержимое'
			ok = false
		}

		if (!form.slug.trim()) {
			fieldErrors.slug = 'Укажите slug'
			ok = false
		}

		return ok
	}

	watch(
		() => [props.open, props.topic] as const,
		([open, topic]) => {
			if (!open) return
			if (!topic) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: topic.id ?? null,
				include_in_sitemap: !!topic.include_in_sitemap,
				include_in_top_menu: !!topic.include_in_top_menu,
				title: topic.title ?? '',
				body: topic.body ?? '',
				slug: topic.slug ?? '',
				meta_title: topic.meta_title ?? '',
				meta_description: topic.meta_description ?? '',
				meta_keywords: topic.meta_keywords ?? '',
			})

			fieldErrors.title = ''
			fieldErrors.body = ''
			fieldErrors.slug = ''

			lastGeneratedSlug.value = slugify(topic.title ?? '')
			slugManuallyEdited.value = Boolean(topic.slug && topic.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => form.title,
		(title) => {
			const generatedSlug = slugify(title ?? '')

			if (!slugManuallyEdited.value || !form.slug || form.slug === lastGeneratedSlug.value) {
				form.slug = generatedSlug
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	const onSlugInput = (value: string | number) => {
		form.slug = String(value)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Topic = {
				id: form.id ?? null,
				include_in_sitemap: !!form.include_in_sitemap,
				include_in_top_menu: !!form.include_in_top_menu,
				title: form.title.trim(),
				body: form.body.trim(),
				slug: form.slug.trim(),
				meta_title: form.meta_title.trim(),
				meta_description: form.meta_description.trim(),
				meta_keywords: form.meta_keywords.trim(),
			}

			if (payload.id) {
				await api.updateTopic(payload)
				toast.success('Тема успешно обновлена')
			} else {
				await api.createTopic(payload)
				toast.success('Тема успешно создана')
			}

			emit('saved')
			emit('close')

			if (!props.topic) {
				resetLocalForm()
			}
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) {
				toast.error(msg)
			} else {
				throw err
			}
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[94vw] max-w-5xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ topic ? 'Редактировать тему' : 'Добавить тему' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6" @submit.prevent="onSubmit">
				<div class="mb-6 border-b border-gray-200">
					<ul class="flex flex-wrap -mb-px text-sm font-medium text-center">
						<li class="mr-2">
							<button type="button" @click="activeTab = 'general'" :class="activeTab === 'general' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="inline-block p-4 border-b-2 rounded-t-lg transition-colors">
								Основное
							</button>
						</li>
						<li class="mr-2">
							<button type="button" @click="activeTab = 'meta'" :class="activeTab === 'meta' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'" class="inline-block p-4 border-b-2 rounded-t-lg transition-colors">
								Мета-данные
							</button>
						</li>
					</ul>
				</div>

				<div v-show="activeTab === 'general'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<TextField
						v-model="form.title"
						class="md:col-span-2"
						label="Title"
						required
						name="title"
						placeholder="Title"
						:error-message="fieldErrors.title"
					/>

					<TextField
						:model-value="form.slug"
						class="md:col-span-2"
						label="Slug"
						required
						name="slug"
						placeholder="Slug"
						:error-message="fieldErrors.slug"
						@update:model-value="onSlugInput"
					/>

					<TextareaField
						v-model="form.body"
						class="md:col-span-2"
						label="Body"
						required
						name="body"
						placeholder="Body"
						:error-message="fieldErrors.body"
					/>

					<div class="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
						<CheckboxField v-model="form.include_in_sitemap" label="Включить в sitemap" name="include_in_sitemap" />
						<CheckboxField v-model="form.include_in_top_menu" label="Включить в top menu" name="include_in_top_menu" />
					</div>
				</div>

				<div v-show="activeTab === 'meta'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
					<TextField v-model="form.meta_title" class="md:col-span-2" label="Meta title" name="meta_title" placeholder="Meta title" />

					<TextareaField
						v-model="form.meta_description"
						class="md:col-span-2"
						label="Meta description"
						name="meta_description"
						placeholder="Meta description"
					/>

					<TextField
						v-model="form.meta_keywords"
						class="md:col-span-2"
						label="Meta keywords"
						name="meta_keywords"
						placeholder="keyword1, keyword2"
					/>
				</div>

				<div class="mt-6 flex items-center justify-end gap-3">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
