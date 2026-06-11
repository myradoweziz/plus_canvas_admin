<script setup lang="ts">
	import { computed, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import { createEmptyRole } from '../helpers/roles'
	import type { Permission, Role } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; role?: Role | null }>()

	const saving = ref(false)
	const loadingPermissions = ref(false)
	const allPermissions = ref<Permission[]>([])
	const permissionsRequestId = ref(0)
	const triedSubmit = ref(false)

	const form = reactive(createEmptyRole())

	const fieldErrors = reactive({
		name: '',
		permissions: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, createEmptyRole())
		fieldErrors.name = ''
		fieldErrors.permissions = ''
		triedSubmit.value = false
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.permissions = ''
		let ok = true

		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.permissions.length) {
			fieldErrors.permissions = 'Выберите хотя бы одно право'
			ok = false
		}

		return ok
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
			if (!role) {
				Object.assign(form, createEmptyRole())
				return
			}

			Object.assign(form, {
				id: role.id ?? null,
				name: role.name ?? '',
				active: role.active !== false,
				permissions: Array.isArray(role.permissions)
					? role.permissions
							.map((permission) =>
								typeof permission === 'string' ? permission : (permission as { name?: string })?.name
							)
							.filter((permission): permission is string => typeof permission === 'string' && permission.length > 0)
					: []
			})
			fieldErrors.name = ''
			fieldErrors.permissions = ''
		},
		{ immediate: true }
	)

	const allPermissionNames = computed(() =>
		allPermissions.value
			.map((permission) => permission.name)
			.filter((name): name is string => typeof name === 'string' && name.length > 0)
	)

	const areAllPermissionsSelected = computed(
		() =>
			allPermissionNames.value.length > 0 &&
			allPermissionNames.value.every((name) => form.permissions.includes(name))
	)

	const isPermissionSelected = (name: string) => form.permissions.includes(name)

	const toggleAllPermissions = (checked: boolean) => {
		form.permissions = checked ? [...allPermissionNames.value] : []
		fieldErrors.permissions = ''
	}

	const togglePermission = (name: string, checked: boolean) => {
		if (checked) {
			if (!form.permissions.includes(name)) {
				form.permissions = [...form.permissions, name]
			}
		} else {
			form.permissions = form.permissions.filter((permission) => permission !== name)
		}

		fieldErrors.permissions = ''
	}

	const loadPermissions = async () => {
		const requestId = permissionsRequestId.value + 1
		permissionsRequestId.value = requestId
		loadingPermissions.value = true

		try {
			const result = await api.listPermissions({ limit: 1000, offset: 0 })
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

	const onSubmit = async () => {
		triedSubmit.value = true
		if (!validate()) return

		saving.value = true
		try {
			const payload: Role = {
				id: form.id ?? null,
				name: form.name.trim(),
				active: !!form.active,
				permissions: form.permissions
			}

			if (payload.id) {
				await api.updateRole(payload)
			} else {
				await api.createRole(payload)
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
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.role ? 'Редактировать роль' : 'Добавить роль' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.name"
					label="Название"
					required
					name="name"
					placeholder="Название роли"
					:error-message="triedSubmit ? fieldErrors.name : ''"
				/>

				<div class="flex items-end pb-1">
					<CheckboxField v-model="form.active" label="Активна" name="active" />
				</div>

				<div class="md:col-span-2">
					<label class="mb-1.5 block text-sm font-medium text-gray-700">
						Права <span class="text-red-500">*</span>
					</label>

					<p v-if="loadingPermissions" class="text-sm text-gray-500">Загрузка прав...</p>

					<div v-else-if="allPermissions.length" class="space-y-3 rounded-xl border border-gray-200 p-3">
						<CheckboxField
							:model-value="areAllPermissionsSelected"
							label="Выбрать все права"
							name="permissions_select_all"
							@update:model-value="toggleAllPermissions"
						/>

						<div class="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
						<CheckboxField
							v-for="permission in allPermissions"
							:key="permission.id ?? permission.name"
							:model-value="isPermissionSelected(permission.name)"
							:label="permission.name"
							:name="`permission_${permission.name}`"
							@update:model-value="(value) => togglePermission(permission.name, value)"
						/>
						</div>
					</div>

					<p v-else class="text-sm text-gray-500">Права не найдены.</p>

					<p v-if="triedSubmit && fieldErrors.permissions" class="mt-1 text-xs text-red-500">
						{{ fieldErrors.permissions }}
					</p>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
