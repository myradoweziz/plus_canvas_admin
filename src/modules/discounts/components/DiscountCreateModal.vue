<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import ImageUpload from '@/shared/ui/ImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { discountsApi } from '../api/discounts'
	import type { Discount } from '../types/discount'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; discount: Discount | null }>()

	const saving = ref(false)

	const { errors, defineField, handleSubmit, resetForm, setValues, values } = useForm({
		initialValues: {
			id: null as number | null,
			title: '',
			description: '',
			image_url: '',
			is_active: false,
			order: 0,
			image: null as File | null
		},
		validationSchema: toTypedSchema(
			z
				.object({
					id: z.number().nullable().optional(),
					title: z.string().trim().min(1, 'Укажите заголовок'),
					description: z.string().trim().optional().nullable(),
					image_url: z.string().trim().optional().nullable(),
					is_active: z.boolean(),
					order: z.coerce.number().min(0, 'Укажите корректный порядок'),
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
	const [order, orderProps] = defineField('order')
	const [description, descriptionProps] = defineField('description')
	const [isActive] = defineField('is_active')
	const [image, imageProps] = defineField('image')

	const resetLocalForm = () => {
		resetForm({
			values: { id: null, title: '', description: '', image_url: '', is_active: false, order: 0, image: null }
		})
	}

	watch(
		() => [props.open, props.discount] as const,
		([open, discount]) => {
			if (!open) return
			if (!discount) {
				resetLocalForm()
				return
			}

			setValues({
				id: discount.id ?? null,
				title: discount.title ?? '',
				description: discount.description ?? '',
				image_url: discount.image_url ?? '',
				is_active: !!discount.is_active,
				order: discount.order ?? 0,
				image: null
			})
		},
		{ immediate: true }
	)

	const onSubmit = handleSubmit(async (values) => {
		saving.value = true
		try {
			const payload: Discount = {
				id: values.id ?? null,
				title: values.title,
				description: values.description ?? '',
				is_active: !!values.is_active,
				order: values.order ?? 0,
				image: (values.image as File | null) ?? null
			}

			if (payload.id) {
				await discountsApi.updateDiscount(payload)
			} else {
				await discountsApi.createDiscount(payload)
			}

			emit('saved')
			emit('close')

			if (!props.discount) {
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
						{{ discount ? 'Редактировать скидку' : 'Добавить скидку' }}
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
						label="Заголовок *"
						name="title"
						placeholder="Заголовок"
						:error-message="errors.title"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model="(order as any)"
						v-bind="orderProps"
						label="Порядок"
						name="order"
						type="number"
						min="0"
						:error-message="errors.order"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model="(description as any)"
						v-bind="descriptionProps"
						label="Описание"
						name="description"
						:error-message="errors.description"
					/>
				</div>

				<div class="md:col-span-2">
					<ImageUpload
						v-model="(image as any)"
						v-bind="imageProps"
						:current-url="values.image_url || ''"
						:error-message="errors.image"
					/>
				</div>

				<CheckboxField v-model="(isActive as any)" label="Активно" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || Object.values(errors).some(Boolean)" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
