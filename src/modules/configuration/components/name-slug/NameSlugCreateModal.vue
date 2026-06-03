<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { slugify } from '@/shared'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import type { NameSlugEntity } from '../../types'

	const props = defineProps<{
		open: boolean
		item: NameSlugEntity | null
		titleCreate: string
		titleEdit: string
		successCreateMessage: string
		successUpdateMessage: string
		onCreate: (entity: NameSlugEntity) => Promise<NameSlugEntity>
		onUpdate: (entity: NameSlugEntity) => Promise<NameSlugEntity>
	}>()

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const saving = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const form = reactive({
		id: null as number | null,
		name: '',
		slug: ''
	})

	const fieldErrors = reactive({
		name: '',
		slug: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, { id: null, name: '', slug: '' })
		fieldErrors.name = ''
		fieldErrors.slug = ''
		slugManuallyEdited.value = false
		lastGeneratedSlug.value = ''
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.slug = ''

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.slug.trim()) {
			fieldErrors.slug = 'Укажите slug'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.item] as const,
		([open, item]) => {
			if (!open) return
			if (!item) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: item.id ?? null,
				name: item.name ?? '',
				slug: item.slug ?? ''
			})
			fieldErrors.name = ''
			fieldErrors.slug = ''
			lastGeneratedSlug.value = slugify(item.name ?? '')
			slugManuallyEdited.value = Boolean(item.slug && item.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => form.name,
		(name) => {
			const generatedSlug = slugify(name ?? '')

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
			const payload: NameSlugEntity = {
				id: form.id ?? null,
				name: form.name.trim(),
				slug: form.slug.trim()
			}

			if (payload.id) {
				await props.onUpdate(payload)
				toast.success(props.successUpdateMessage)
			} else {
				await props.onCreate(payload)
				toast.success(props.successCreateMessage)
			}

			emit('saved')
			emit('close')

			if (!props.item) resetLocalForm()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-[100000] mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ item ? titleEdit : titleCreate }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField
						v-model="form.name"
						label="Название"
						required
						name="name"
						placeholder="Название"
						:error-message="fieldErrors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="form.slug"
						label="Slug"
						required
						name="slug"
						placeholder="Slug"
						:error-message="fieldErrors.slug"
						@update:model-value="onSlugInput"
					/>
				</div>

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
