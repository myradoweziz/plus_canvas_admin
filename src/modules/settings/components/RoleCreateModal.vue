<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { permissionsApi } from '../api/permissions'
	import { rolesApi } from '../api/roles'
	import type { Permission } from '../types/permission'
	import type { Role } from '../types/role'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; role?: Role | null }>()

const saving = ref(false)
const loadingPermissions = ref(false)
const allPermissions = ref<Permission[]>([])
const selectedPermissionName = ref<string | null>(null)
const permissionsRequestId = ref(0)
const triedSubmit = ref(false)

	const { errors, defineField, handleSubmit, resetForm, setValues, values } = useForm({
		initialValues: {
			id: null as number | null,
			name: '',
			permissions: [] as string[]
		},
		validationSchema: toTypedSchema(
			z.object({
				id: z.number().nullable().optional(),
				name: z.string().trim().min(1, 'Укажите название'),
				permissions: z.array(z.string()).min(1, 'Выберите хотя бы одно право')
			})
		)
	})

	const [name, nameProps] = defineField('name')

	const resetLocalForm = () => {
		resetForm({ values: { id: null, name: '', permissions: [] } })
	triedSubmit.value = false
		selectedPermissionName.value = null
	}

	watch(
		() => props.open,
		(open) => {
		if (!open) resetLocalForm()
		else triedSubmit.value = false
		}
	)

	watch(
		() => props.role,
		(role) => {
			if (!role) return
			setValues({
				id: role.id ?? null,
				name: role.name ?? '',
				permissions: Array.isArray(role.permissions)
					? role.permissions
							.map((p) => (typeof p === 'string' ? p : (p as any)?.name))
							.filter((p): p is string => typeof p === 'string' && p.length > 0)
					: []
			})
		},
		{ immediate: true }
	)

	const permissionOptions = computed(() =>
		allPermissions.value
			.map((p) => p.name)
			.filter((name): name is string => typeof name === 'string' && name.length > 0)
			.filter((name) => !(values.permissions || []).includes(name))
			.map((name) => ({ label: name, value: name }))
	)

	const addPermission = (value: string | number | null) => {
		selectedPermissionName.value = null
		if (!value) return
		const name = String(value)
		if (!(values.permissions || []).includes(name)) {
			setValues({ ...values, permissions: [...(values.permissions || []), name] } as any)
		}
	}

	const removePermission = (name: string) => {
		setValues({ ...values, permissions: (values.permissions || []).filter((p) => p !== name) } as any)
	}

	const loadPermissions = async () => {
		const requestId = permissionsRequestId.value + 1
		permissionsRequestId.value = requestId
		loadingPermissions.value = true
		try {
			const result = await permissionsApi.listPermissions({ limit: 1000, offset: 0 })
			if (requestId !== permissionsRequestId.value) return
			allPermissions.value = result.items || []
		} finally {
			if (requestId === permissionsRequestId.value) {
				loadingPermissions.value = false
			}
		}
	}

	watch(
		() => props.open,
		(open) => {
			if (!open) return
			loadPermissions()
		},
		{ immediate: true }
	)

	const onSubmit = handleSubmit(
		async (v) => {
			triedSubmit.value = true
			saving.value = true
			try {
				const payload: Role = {
					id: v.id ?? null,
					name: v.name,
					permissions: v.permissions || []
				}
				if (payload.id) {
					await rolesApi.updateRole(payload)
				} else {
					await rolesApi.createRole(payload)
				}
				emit('saved')
				emit('close')
				resetLocalForm()
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
		<div class="relative z-100000 mx-auto w-[92vw] max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.role ? 'Редактировать role' : 'Добавить role' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-2">
					<TextField
						v-model="name"
						v-bind="nameProps"
						label="Название *"
						name="name"
						placeholder="название роли"
						:error-message="errors.name"
					/>
				</div>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedPermissionName"
						label="Права"
						name="permissions"
						placeholder="Выберите право"
						:options="permissionOptions"
						:disabled="loadingPermissions"
						:error-message="triedSubmit ? errors.permissions : ''"
						@update:model-value="addPermission"
					/>

					<div v-if="(values.permissions || []).length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="permission in values.permissions || []"
							:key="permission"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							<span class="truncate max-w-[260px]">{{ permission }}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removePermission(permission)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || Object.values(errors).some(Boolean)" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>

