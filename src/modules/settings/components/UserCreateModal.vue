<script setup lang="ts">
	import { computed, ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { rolesApi } from '../api/roles'
	import { usersApi } from '../api/users'
	import type { Role } from '../types/role'
	import type { User, UserAddress } from '../types/user'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; user?: User | null }>()

	const saving = ref(false)
	const loadingRoles = ref(false)
	const allRoles = ref<Role[]>([])
	const selectedRoleName = ref<string | null>(null)

	const form = ref<User>({
		id: null,
		name: '',
		email: '',
		phone_number: '',
		password: '',
		password_confirmation: '',
		roles: [],
		addresses: [
			{
				address: '',
				city: '',
				is_default: true
			}
		]
	})

	const resetForm = () => {
		form.value = {
			id: null,
			name: '',
			email: '',
			phone_number: '',
			password: '',
			password_confirmation: '',
			roles: [],
			addresses: [
				{
					address: '',
					city: '',
					is_default: true
				}
			]
		}
		selectedRoleName.value = null
	}

	const loadRoles = async () => {
		loadingRoles.value = true
		try {
			const result = await rolesApi.listRoles({ limit: 1000, offset: 0 })
			allRoles.value = result.items || []
		} finally {
			loadingRoles.value = false
		}
	}

	watch(
		() => props.open,
		(open) => {
			if (!open) return
			loadRoles()
		},
		{ immediate: true }
	)

	watch(
		() => props.user,
		(user) => {
			if (!user) return
			form.value = {
				id: user.id ?? null,
				name: user.name ?? '',
				email: user.email ?? '',
				phone_number: user.phone_number ?? '',
				password: '',
				password_confirmation: '',
				roles: Array.isArray(user.roles) ? user.roles : [],
				addresses: Array.isArray(user.addresses) && user.addresses.length ? user.addresses : []
			}
		},
		{ immediate: true }
	)

	const roleOptions = computed(() =>
		allRoles.value
			.map((r) => r.name)
			.filter((name): name is string => typeof name === 'string' && name.length > 0)
			.filter((name) => !form.value.roles.includes(name))
			.map((name) => ({ label: name, value: name }))
	)

	const addRole = (value: string | number | null) => {
		selectedRoleName.value = null
		if (!value) return
		const name = String(value)
		if (!form.value.roles.includes(name)) form.value.roles.push(name)
	}

	const removeRole = (name: string) => {
		form.value.roles = form.value.roles.filter((r) => r !== name)
	}

	const addAddress = () => {
		const next: UserAddress = {
			address: '',
			city: '',
			is_default: false
		}
		form.value.addresses = [...(form.value.addresses || []), next]
	}

	const removeAddress = (index: number) => {
		form.value.addresses = (form.value.addresses || []).filter((_, idx) => idx !== index)
	}

	const setDefaultAddress = (index: number, value: boolean) => {
		if (!value) {
			form.value.addresses[index].is_default = false
			return
		}
		form.value.addresses = (form.value.addresses || []).map((a, idx) => ({
			...a,
			is_default: idx === index
		}))
	}

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.user?.id) {
				await usersApi.updateUser(form.value)
			} else {
				await usersApi.createUser(form.value)
			}
			emit('saved')
			emit('close')
			resetForm()
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div
			class="relative z-100000 mx-auto w-[94vw] max-w-5xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.user ? 'Редактировать user' : 'Добавить user' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3" @submit.prevent="onSubmit">
				<TextField v-model.trim="form.name" label="Имя *" name="name" placeholder="Имя" />
				<TextField v-model.trim="form.email" label="Email *" type="email" name="email" placeholder="Email" />
				<TextField
					v-model.trim="form.phone_number"
					label="Телефон *"
					type="tel"
					name="phone_number"
					placeholder="Телефон"
				/>

				<TextField
					v-if="!user"
					v-model.trim="form.password"
					label="Пароль *"
					name="password"
					type="password"
					placeholder="Пароль"
				/>
				<TextField
					v-if="!user"
					v-model.trim="form.password_confirmation"
					label="Подтверждение пароля *"
					name="password_confirmation"
					type="password"
					placeholder="Подтверждение пароля"
				/>
				<div v-if="user" class="md:col-span-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
					Пароль: оставьте пустым, если не нужно менять.
				</div>

				<div class="md:col-span-3">
					<SelectField
						:model-value="selectedRoleName"
						label="Роли"
						name="roles"
						placeholder="Выберите роль"
						:options="roleOptions"
						:disabled="loadingRoles"
						@update:model-value="addRole"
					/>
					<div v-if="form.roles.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="role in form.roles"
							:key="role"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							<span class="truncate max-w-[260px]">{{ role }}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removeRole(role)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<div class="md:col-span-3">
					<div class="flex items-center justify-between">
						<p class="text-sm font-semibold text-gray-900">Addresses</p>
						<Button type="button" variant="outline" size="sm" :on-click="addAddress">Добавить адрес</Button>
					</div>

					<div class="mt-3 space-y-4">
						<div
							v-for="(address, index) in form.addresses"
							:key="index"
							class="rounded-xl border border-gray-200 bg-white p-4"
						>
							<div class="flex items-start justify-between gap-3">
								<p class="text-sm font-semibold text-gray-800">Address #{{ index + 1 }}</p>
								<Button
									v-if="form.addresses.length > 1"
									type="button"
									variant="ghost"
									size="icon"
									class-name="hover:text-red-700"
									:on-click="() => removeAddress(index)"
								>
									✕
								</Button>
							</div>

							<div class="mt-3 grid grid-cols-1 gap-4 md:grid-cols-3">
								<TextField v-model.trim="address.city" label="City" name="city" placeholder="City" />
								<CheckboxField
									:model-value="address.is_default"
									label="Default"
									name="is_default"
									@update:model-value="(v) => setDefaultAddress(index, v)"
								/>

								<div class="md:col-span-3">
									<TextareaField v-model.trim="address.address" label="Address" name="address" placeholder="Address" />
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')"> Отмена </Button>
					<Button
						type="submit"
						size="sm"
						:disabled="saving || !form.name || !form.email || !form.phone_number"
						:loading="saving"
					>
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
