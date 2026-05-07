<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import ColorPicker from '@/shared/ui/ColorPicker.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { colorsApi } from '../api/colors'
	import type { Color } from '../types/color'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; color: Color | null }>()

	const saving = ref(false)

	const { errors, defineField, handleSubmit, resetForm, setValues } = useForm({
		initialValues: {
			id: null as number | null,
			name: '',
			hex_code: '#000000',
			is_active: false
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				name: z.string().trim().min(1, 'Укажите название'),
				hex_code: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Укажите корректный цвет'),
				is_active: z.boolean()
			})
		)
	})

	const [name, nameProps] = defineField('name')
	const [hexCode, hexCodeProps] = defineField('hex_code')
	const [isActive] = defineField('is_active')

	const resetLocalForm = () => {
		resetForm({ values: { id: null, name: '', hex_code: '#000000', is_active: false } })
	}

	watch(
		() => [props.open, props.color] as const,
		([open, color]) => {
			if (!open) return
			if (!color) {
				resetLocalForm()
				return
			}

			setValues({
				id: color.id ?? null,
				name: color.name ?? '',
				hex_code: color.hex_code ?? '#000000',
				is_active: !!color.is_active
			})
		},
		{ immediate: true }
	)

	const onSubmit = handleSubmit(async (values) => {
		saving.value = true
		try {
			const payload: Color = {
				id: values.id ?? null,
				name: values.name,
				hex_code: values.hex_code,
				is_active: !!values.is_active
			}

			if (payload.id) {
				await colorsApi.updateColor(payload)
			} else {
				await colorsApi.createColor(payload)
			}

			emit('saved')
			emit('close')

			if (!props.color) {
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
						{{ color ? 'Редактировать цвет' : 'Добавить цвет' }}
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
						v-model="name"
						v-bind="nameProps"
						label="Название *"
						name="name"
						placeholder="Название"
						:error-message="errors.name"
					/>
				</div>

				<div class="md:col-span-1">
					<ColorPicker v-model="hexCode" v-bind="hexCodeProps" label="Цвет *" name="hex_code" :error-message="errors.hex_code" />
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
