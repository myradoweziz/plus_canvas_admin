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
	const activeTab = ref('general')
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

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

	const onSlugInput = (value: string | number) => {
		form.slug = String(value)
		slugManuallyEdited.value = String(value) !== lastGeneratedSlug.value
	}

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
				include_in_sitemap: !!topic.include_in_sitemap,
				include_in_top_menu: !!topic.include_in_top_menu,
				title: topic.title ?? '',
				body: topic.body ?? '',
				slug: topic.slug ?? '',
				meta_title: topic.meta_title ?? '',
				meta_description: topic.meta_description ?? '',
				meta_keywords: topic.meta_keywords ?? '',
			})

			lastGeneratedSlug.value = slugify(topic.title ?? '')
			slugManuallyEdited.value = Boolean(topic.slug && topic.slug !== lastGeneratedSlug.value)
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		await load()
	})

	const onSubmit = async () => {
		if (!id.value) return
		if (!validate()) return

		saving.value = true
		try {
			const payload: Topic = {
				id: id.value,
				include_in_sitemap: !!form.include_in_sitemap,
				include_in_top_menu: !!form.include_in_top_menu,
				title: form.title.trim(),
				body: form.body.trim(),
				slug: form.slug.trim(),
				meta_title: form.meta_title.trim(),
				meta_description: form.meta_description.trim(),
				meta_keywords: form.meta_keywords.trim(),
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

		<form v-else @submit.prevent="onSubmit">
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
					:disabled="loading"
				/>

				<TextField
					:model-value="form.slug"
					class="md:col-span-2"
					label="Slug"
					required
					name="slug"
					placeholder="Slug"
					:error-message="fieldErrors.slug"
					:disabled="loading"
					@update:model-value="onSlugInput"
				/>

				<div class="md:col-span-2">
					<RichTextEditor v-model="form.body" label="Body" name="body" :error-message="fieldErrors.body" required />
				</div>

				<div class="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
					<CheckboxField v-model="form.include_in_sitemap" label="Включить в sitemap" name="include_in_sitemap" :disabled="loading" />
					<CheckboxField v-model="form.include_in_top_menu" label="Включить в top menu" name="include_in_top_menu" :disabled="loading" />
				</div>
			</div>

			<div v-show="activeTab === 'meta'" class="grid grid-cols-1 gap-4 md:grid-cols-2">
				<TextField v-model="form.meta_title" class="md:col-span-2" label="Meta title" name="meta_title" placeholder="Meta title" :disabled="loading" />

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
			</div>

			<div class="mt-6 flex items-center justify-end gap-3">
				<Button type="button" variant="outline" size="sm" :on-click="goBack">Отмена</Button>
				<Button type="submit" size="sm" :disabled="saving || loading" :loading="saving">Сохранить</Button>
			</div>
		</form>
	</div>
</template>

