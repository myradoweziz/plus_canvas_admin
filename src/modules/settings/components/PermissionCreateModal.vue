<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { permissionsApi } from '../api/permissions'
	import type { Permission } from '../types/permission'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; permission?: Permission | null }>()

	const saving = ref(false)
	const triedSubmit = ref(false)

	const { errors, defineField, handleSubmit, resetForm, setValues } = useForm({
		initialValues: {
			id: null as number | null,
			name: ''
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				name: z.string().trim().min(1, 'Укажите название')
			})
		)
	})

	const [name, nameProps] = defineField('name')

	watch(
		() => [props.open, props.permission] as const,
		([open, permission]) => {
			if (!open) {
				triedSubmit.value = false
				resetForm({ values: { id: null, name: '' } })
				return
			}

			triedSubmit.value = false
			setValues({ id: permission?.id ?? null, name: permission?.name ?? '' })
		}
	)

	const onSubmit = handleSubmit(
		async (values) => {
			triedSubmit.value = true
			saving.value = true
			try {
				if (values.id) {
					await permissionsApi.updatePermission({ id: values.id, name: values.name })
				} else {
					const payload: Permission = { id: null, name: values.name }
					await permissionsApi.createPermission(payload)
				}
				emit('saved')
				emit('close')
				resetForm({ values: { id: null, name: '' } })
			} catch (err) {
				const msg = getFirstBackendValidationMessage(err)
				if (msg) toast.error(msg)
				else throw err
			} finally {
				saving.value = false
			}
		},
		() => {
			triedSubmit.value = true
		}
	)
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.permission ? 'Редактировать permission' : 'Добавить permission' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Введите name и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4" @submit.prevent="onSubmit">
				<TextField
					v-model="name"
					v-bind="nameProps"
					label="Название *"
					name="name"
					placeholder="название права"
					:error-message="triedSubmit ? errors.name : ''"
				/>

				<div class="mt-2 flex items-center justify-end gap-3">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving || !!errors.name" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
