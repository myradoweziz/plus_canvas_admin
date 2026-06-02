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
	import { api as configurationApi } from '@/modules/configuration/api'
	import { api } from '../api'
	import type { Topic } from '../types'
	import type { Store } from '@/modules/configuration/types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; topic: Topic | null }>()

	const saving = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')
	const stores = ref<{ label: string; value: number }[]>([])
	const loadingStores = ref(false)

	const loadStores = async () => {
		loadingStores.value = true
		try {
			const items = await configurationApi.listAllStores()
			stores.value = items
				.filter((item: Store) => item.id != null)
				.map((item: Store) => ({ label: item.name, value: item.id as number }))
		} finally {
			loadingStores.value = false
		}
	}

	const onStoreChange = (value: string | number | null) => {
		if (value === null || value === undefined || String(value).trim() === '') {
			form.store_id = 0
			return
		}
		form.store_id = Number(value) || 0
	}

	const form = reactive({
		id: null as number | null,
		system_name: '',
		is_password_protected: false,
		password: '',
		include_in_sitemap: false,
		include_in_top_menu: false,
		title: '',
		body: '',
		slug: '',
		meta_title: '',
		meta_description: '',
		meta_keywords: '',
		store_id: 0
	})

	const fieldErrors = reactive({
		system_name: '',
		password: '',
		title: '',
		body: '',
		slug: '',
		store_id: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			system_name: '',
			is_password_protected: false,
			password: '',
			include_in_sitemap: false,
			include_in_top_menu: false,
			title: '',
			body: '',
			slug: '',
			meta_title: '',
			meta_description: '',
			meta_keywords: '',
			store_id: 0
		})
		fieldErrors.system_name = ''
		fieldErrors.password = ''
		fieldErrors.title = ''
		fieldErrors.body = ''
		fieldErrors.slug = ''
		fieldErrors.store_id = ''
	}

	const validate = () => {
		fieldErrors.system_name = ''
		fieldErrors.password = ''
		fieldErrors.title = ''
		fieldErrors.body = ''
		fieldErrors.slug = ''
		fieldErrors.store_id = ''

		let ok = true

		if (!form.system_name.trim()) {
			fieldErrors.system_name = 'Укажите system name'
			ok = false
		}

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

		const storeId = Number(form.store_id)
		if (!Number.isInteger(storeId) || storeId <= 0) {
			fieldErrors.store_id = 'Укажите корректный store_id'
			ok = false
		}

		if (form.is_password_protected && !form.password.trim()) {
			fieldErrors.password = 'Укажите пароль'
			ok = false
		}

		return ok
	}

	watch(
		() => form.is_password_protected,
		(value) => {
			if (!value) {
				form.password = ''
				fieldErrors.password = ''
			}
		}
	)

	watch(
		() => [props.open, props.topic] as const,
		([open, topic]) => {
			if (!open) return
			loadStores()
			if (!topic) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: topic.id ?? null,
				system_name: topic.system_name ?? '',
				is_password_protected: !!topic.is_password_protected,
				password: topic.is_password_protected ? topic.password ?? '' : '',
				include_in_sitemap: !!topic.include_in_sitemap,
				include_in_top_menu: !!topic.include_in_top_menu,
				title: topic.title ?? '',
				body: topic.body ?? '',
				slug: topic.slug ?? '',
				meta_title: topic.meta_title ?? '',
				meta_description: topic.meta_description ?? '',
				meta_keywords: topic.meta_keywords ?? '',
				store_id: Number(topic.store_id) || 0
			})

			fieldErrors.system_name = ''
			fieldErrors.password = ''
			fieldErrors.title = ''
			fieldErrors.body = ''
			fieldErrors.slug = ''
			fieldErrors.store_id = ''

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
				system_name: form.system_name.trim(),
				is_password_protected: !!form.is_password_protected,
				password: form.is_password_protected ? form.password.trim() : '',
				include_in_sitemap: !!form.include_in_sitemap,
				include_in_top_menu: !!form.include_in_top_menu,
				title: form.title.trim(),
				body: form.body.trim(),
				slug: form.slug.trim(),
				meta_title: form.meta_title.trim(),
				meta_description: form.meta_description.trim(),
				meta_keywords: form.meta_keywords.trim(),
				store_id: Number(form.store_id) || 0
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

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.system_name"
					label="System name"
					required
					name="system_name"
					placeholder="System name"
					:error-message="fieldErrors.system_name"
				/>

				<SelectField
					:model-value="form.store_id || null"
					label="Магазин"
					required
					name="store_id"
					placeholder="Выберите магазин"
					:disabled="loadingStores"
					:options="stores"
					:error-message="fieldErrors.store_id"
					@update:model-value="onStoreChange"
				/>

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
					label="Slug"
					required
					name="slug"
					placeholder="Slug"
					:error-message="fieldErrors.slug"
					@update:model-value="onSlugInput"
				/>

				<TextField v-model="form.meta_title" label="Meta title" name="meta_title" placeholder="Meta title" />

				<TextareaField
					v-model="form.body"
					class="md:col-span-2"
					label="Body"
					required
					name="body"
					placeholder="Body"
					:error-message="fieldErrors.body"
				/>

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

				<div class="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-3">
					<CheckboxField
						v-model="form.include_in_sitemap"
						label="Включить в sitemap"
						name="include_in_sitemap"
					/>
					<CheckboxField
						v-model="form.include_in_top_menu"
						label="Включить в top menu"
						name="include_in_top_menu"
					/>
					<CheckboxField
						v-model="form.is_password_protected"
						label="Защищено паролем"
						name="is_password_protected"
					/>
				</div>

				<TextField
					v-model="form.password"
					:disabled="!form.is_password_protected"
					:required="form.is_password_protected"
					name="password"
					type="password"
					label="Password"
					placeholder="Password"
					:error-message="fieldErrors.password"
				/>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
