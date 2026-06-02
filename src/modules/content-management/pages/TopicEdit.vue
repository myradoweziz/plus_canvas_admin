<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, reactive, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { slugify } from '@/shared'
	import { api as configurationApi } from '@/modules/configuration/api'
	import type { Store } from '@/modules/configuration/types'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { DocsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Topic } from '../types'

	const route = useRoute()
	const router = useRouter()

	const id = computed(() => {
		const raw = route.params.id
		const value = typeof raw === 'string' ? Number(raw) : Array.isArray(raw) ? Number(raw[0]) : NaN
		return Number.isFinite(value) ? value : null
	})

	const saving = ref(false)
	const loading = ref(false)
	const loadingStores = ref(false)

	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const stores = ref<{ label: string; value: number }[]>([])

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

	const onStoreChange = (value: string | number | null) => {
		if (value === null || value === undefined || String(value).trim() === '') {
			form.store_id = 0
			return
		}
		form.store_id = Number(value) || 0
	}

	const onSlugInput = (value: string | number) => {
		form.slug = String(value)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
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

	const load = async () => {
		if (!id.value) return

		loading.value = true
		try {
			const topic = await api.getTopicById(id.value)
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

			lastGeneratedSlug.value = slugify(topic.title ?? '')
			slugManuallyEdited.value = Boolean(topic.slug && topic.slug !== lastGeneratedSlug.value)
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		await Promise.all([loadStores(), load()])
	})

	const onSubmit = async () => {
		if (!id.value) return
		if (!validate()) return

		saving.value = true
		try {
			const payload: Topic = {
				id: id.value,
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

			await api.updateTopic(payload)
			toast.success('Тема успешно обновлена')
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			saving.value = false
		}
	}

	const goBack = () => router.push('/admin-panel/content-management/topics')

	const RichTextEditor = defineAsyncComponent(() => import('@/shared/ui/RichTextEditor.vue'))
</script>

<template>
	<div class="space-y-6">
		<Banner :title="form.title ? `Topics — ${form.title}` : 'Редактировать тему'" subtitle="Редактирование темы." :icon="DocsIcon">
			<template #actions>
				<Button type="button" variant="outline" size="sm" :on-click="goBack">Назад</Button>
				<Button type="button" size="sm" :disabled="saving || loading" :loading="saving" :on-click="onSubmit">Сохранить</Button>
			</template>
		</Banner>

		<div v-if="!id" class="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Некорректный id темы в URL.</div>

		<form v-else class="grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
			<TextField
				v-model="form.system_name"
				label="System name"
				required
				name="system_name"
				placeholder="System name"
				:error-message="fieldErrors.system_name"
				:disabled="loading"
			/>

			<SelectField
				:model-value="form.store_id || null"
				label="Магазин"
				required
				name="store_id"
				placeholder="Выберите магазин"
				:disabled="loading || loadingStores"
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
				:disabled="loading"
			/>

			<TextField
				:model-value="form.slug"
				label="Slug"
				required
				name="slug"
				placeholder="Slug"
				:error-message="fieldErrors.slug"
				:disabled="loading"
				@update:model-value="onSlugInput"
			/>

			<TextField v-model="form.meta_title" label="Meta title" name="meta_title" placeholder="Meta title" :disabled="loading" />

			<div class="md:col-span-2">
				<RichTextEditor v-model="form.body" label="Body" name="body" :error-message="fieldErrors.body" required />
			</div>

			<TextareaField
				v-model="form.meta_description"
				class="md:col-span-2"
				label="Meta description"
				name="meta_description"
				placeholder="Meta description"
				:disabled="loading"
			/>

			<TextField
				v-model="form.meta_keywords"
				class="md:col-span-2"
				label="Meta keywords"
				name="meta_keywords"
				placeholder="keyword1, keyword2"
				:disabled="loading"
			/>

			<div class="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-3">
				<CheckboxField v-model="form.include_in_sitemap" label="Включить в sitemap" name="include_in_sitemap" :disabled="loading" />
				<CheckboxField v-model="form.include_in_top_menu" label="Включить в top menu" name="include_in_top_menu" :disabled="loading" />
				<CheckboxField
					v-model="form.is_password_protected"
					label="Защищено паролем"
					name="is_password_protected"
					:disabled="loading"
				/>
			</div>

			<TextField
				v-model="form.password"
				:disabled="loading || !form.is_password_protected"
				:required="form.is_password_protected"
				name="password"
				type="password"
				label="Password"
				placeholder="Password"
				:error-message="fieldErrors.password"
			/>

			<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
				<Button type="button" variant="outline" size="sm" :on-click="goBack">Отмена</Button>
				<Button type="submit" size="sm" :disabled="saving || loading" :loading="saving">Сохранить</Button>
			</div>
		</form>
	</div>
</template>

