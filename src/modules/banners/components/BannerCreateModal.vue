<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import ImageUpload from '@/shared/ui/ImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { bannersApi } from '../api/banners'
	import type { Banner } from '../types/banner'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()

	const props = defineProps<{ open: boolean; banner: Banner | null }>()

	const saving = ref(false)
	const urlRegex = /^https?:\/\/\S+$/i

	const { errors, defineField, handleSubmit, resetForm, setValues, values } = useForm({
		initialValues: {
			id: null as number | null,
			title: '',
			description: '',
			image_url: '',
			url: '',
			order: 0,
			is_active: false,
			image: null as File | null
		},
		validationSchema: toTypedSchema(
			z
				.object({
					id: z.number().nullable().optional(),
					title: z.string().trim().min(1, 'Укажите заголовок'),
					description: z.string().trim().optional().nullable(),
					image_url: z.string().trim().optional().nullable(),
					url: z
						.string()
						.trim()
						.min(1, 'Укажите URL')
						.refine((v) => urlRegex.test(v), 'Некорректный URL'),
					order: z.number().optional(),
					is_active: z.boolean(),
					image: z.custom<File | null>().optional()
				})
				.superRefine((v, ctx) => {
					if (!v.id && !v.image && !v.image_url) {
						ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['image'], message: 'Выберите изображение' })
					}
				})
		)
	})

	const [title, titleProps] = defineField('title')
	const [order] = defineField('order')
	const [description, descriptionProps] = defineField('description')
	const [url, urlProps] = defineField('url')
	const [isActive] = defineField('is_active')
	const [image, imageProps] = defineField('image')

	const resetLocalForm = () => {
		resetForm({
			values: { id: null, title: '', description: '', image_url: '', url: '', order: 0, is_active: false, image: null }
		})
	}

	watch(
		() => [props.open, props.banner] as const,
		([open, banner]) => {
			if (!open) return
			if (!banner) {
				resetLocalForm()
				return
			}
			setValues({
				id: banner.id ?? null,
				title: banner.title ?? '',
				description: banner.description ?? '',
				image_url: banner.image_url ?? '',
				url: banner.url ?? '',
				order: banner.order ?? 0,
				is_active: !!banner.is_active,
				image: null
			})
		},
		{ immediate: true }
	)

	const isFormValid = computed(() => !Object.values(errors.value).some(Boolean))

	const onSubmit = handleSubmit(async (v) => {
		saving.value = true
		try {
			const payload: Banner = {
				id: v.id ?? null,
				title: v.title,
				description: v.description ?? '',
				url: v.url ?? '',
				order: v.order ?? 0,
				is_active: !!v.is_active,
				image: (v.image as File | null) ?? null
			}

			if (props.banner?.id) {
				await bannersApi.updateBanner(payload)
			} else {
				await bannersApi.createBanner(payload)
			}

			emit('created')
			emit('close')

			if (!props.banner) {
				resetLocalForm()
			}
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			saving.value = false
		}
	})
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ banner ? 'Редактировать баннер' : 'Добавить баннер' }}
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
						v-model="title"
						v-bind="titleProps"
						label="Заголовок"
						name="title"
						placeholder="Заголовок"
						:error-message="errors.title"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField v-model="order" label="Порядок" name="order" type="number" min="0" />
				</div>

				<div class="md:col-span-2">
					<TextareaField
						:model-value="description as any"
						v-bind="descriptionProps"
						label="Описание"
						name="description"
						:error-message="errors.description"
						@update:model-value="(v) => ((description as any).value = v)"
					/>
				</div>

				<div class="md:col-span-2">
					<TextField
						:model-value="url as any"
						v-bind="urlProps"
						label="URL"
						name="url"
						placeholder="URL"
						:error-message="errors.url"
						@update:model-value="(v) => ((url as any).value = v)"
					/>
				</div>

				<div class="md:col-span-2">
					<ImageUpload
						:model-value="image as any"
						v-bind="imageProps"
						:current-url="values.image_url || ''"
						:error-message="errors.image"
						@update:model-value="(v) => ((image as any).value = v)"
					/>
				</div>

				<CheckboxField
					:model-value="isActive as any"
					label="Активно"
					name="is_active"
					class="md:col-span-2"
					@update:model-value="(v) => ((isActive as any).value = v)"
				/>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || !isFormValid" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
