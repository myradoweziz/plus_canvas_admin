<script setup lang="ts">
	import { computed, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api as productsApi } from '@/modules/products/api'
	import type { CanvasProduct } from '@/modules/products/types'
	import { api } from '../api'
	import { createEmptyRole } from '../helpers/roles'
	import type { Permission, Role } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; role?: Role | null }>()

	const saving = ref(false)
	const loadingPermissions = ref(false)
	const loadingProducts = ref(false)
	const allPermissions = ref<Permission[]>([])
	const products = ref<CanvasProduct[]>([])
	const selectedPermissionName = ref<string | null>(null)
	const permissionsRequestId = ref(0)
	const productsRequestId = ref(0)
	const triedSubmit = ref(false)

	const form = reactive(createEmptyRole())

	const fieldErrors = reactive({
		name: '',
		system_name: '',
		permissions: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, createEmptyRole())
		fieldErrors.name = ''
		fieldErrors.system_name = ''
		fieldErrors.permissions = ''
		triedSubmit.value = false
		selectedPermissionName.value = null
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.system_name = ''
		fieldErrors.permissions = ''
		let ok = true

		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.system_name.trim()) {
			fieldErrors.system_name = 'Укажите system name'
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
				system_name: role.system_name ?? '',
				free_shipping: !!role.free_shipping,
				tax_exempt: !!role.tax_exempt,
				active: role.active !== false,
				is_system_role: !!role.is_system_role,
				purchased_with_product: Number(role.purchased_with_product ?? 0),
				permissions: Array.isArray(role.permissions)
					? role.permissions
							.map((p) => (typeof p === 'string' ? p : (p as { name?: string })?.name))
							.filter((p): p is string => typeof p === 'string' && p.length > 0)
					: []
			})
			fieldErrors.name = ''
			fieldErrors.system_name = ''
			fieldErrors.permissions = ''
		},
		{ immediate: true }
	)

	const productOptions = computed(() => [
		{ label: 'Не выбран', value: 0 },
		...products.value
			.filter((product): product is CanvasProduct & { id: number } => product.id !== null)
			.map((product) => ({
				label: product.name,
				value: product.id
			}))
	])

	const permissionOptions = computed(() =>
		allPermissions.value
			.map((p) => p.name)
			.filter((name): name is string => typeof name === 'string' && name.length > 0)
			.filter((name) => !(form.permissions || []).includes(name))
			.map((name) => ({ label: name, value: name }))
	)

	const addPermission = (value: string | number | null) => {
		selectedPermissionName.value = null
		if (!value) return
		const name = String(value)
		if (!(form.permissions || []).includes(name)) form.permissions = [...(form.permissions || []), name]
		fieldErrors.permissions = ''
	}

	const removePermission = (name: string) => {
		form.permissions = (form.permissions || []).filter((p) => p !== name)
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

	const loadProducts = async () => {
		const requestId = productsRequestId.value + 1
		productsRequestId.value = requestId
		loadingProducts.value = true

		try {
			const result = await productsApi.listCanvasProducts({ limit: 1000, offset: 0 })
			if (requestId !== productsRequestId.value) return
			products.value = result.items || []
		} finally {
			if (requestId === productsRequestId.value) {
				loadingProducts.value = false
			}
		}
	}

	watch(
		() => props.open,
		(open) => {
			if (!open) return
			loadPermissions()
			loadProducts()
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
				system_name: form.system_name.trim(),
				free_shipping: !!form.free_shipping,
				tax_exempt: !!form.tax_exempt,
				active: !!form.active,
				is_system_role: !!form.is_system_role,
				purchased_with_product: Number(form.purchased_with_product ?? 0),
				permissions: form.permissions || []
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
						{{ props.role ? 'Редактировать role' : 'Добавить role' }}
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
					placeholder="название роли"
					:error-message="triedSubmit ? fieldErrors.name : ''"
				/>

				<TextField
					v-model="form.system_name"
					label="System name"
					required
					name="system_name"
					placeholder="system_name"
					:error-message="triedSubmit ? fieldErrors.system_name : ''"
				/>

				<SelectField
					v-model="form.purchased_with_product"
					label="Purchased with product"
					name="purchased_with_product"
					placeholder="Выберите продукт"
					:options="productOptions"
					:disabled="loadingProducts"
				/>

				<div class="flex flex-col gap-3 md:col-span-2">
					<CheckboxField v-model="form.free_shipping" label="Free shipping" name="free_shipping" />
					<CheckboxField v-model="form.tax_exempt" label="Tax exempt" name="tax_exempt" />
					<CheckboxField v-model="form.active" label="Active" name="active" />
					<CheckboxField v-model="form.is_system_role" label="System role" name="is_system_role" />
				</div>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedPermissionName"
						label="Права"
						required
						name="permissions"
						placeholder="Выберите право"
						:options="permissionOptions"
						:disabled="loadingPermissions"
						:error-message="triedSubmit ? fieldErrors.permissions : ''"
						@update:model-value="addPermission"
					/>

					<div v-if="(form.permissions || []).length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="permission in form.permissions || []"
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
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
