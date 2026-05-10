<script setup lang="ts">
	import { computed, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { rolesApi } from '../api/roles'
	import { usersApi } from '../api/users'
	import type { Role } from '../types/role'
	import type { User, UserAddress } from '../types/user'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; user?: User | null }>()

	const saving = ref(false)
	const triedSubmit = ref(false)
	const loadingRoles = ref(false)
	const allRoles = ref<Role[]>([])
	const selectedRoleName = ref<string | null>(null)

	const emptyAddress = (): UserAddress => ({ address: '', city: '', is_default: true })

	const form = reactive({
		id: null as number | null,
		name: '',
		email: '',
		phone_number: '',
		password: '',
		password_confirmation: '',
		roles: [] as string[],
		addresses: [emptyAddress()] as UserAddress[]
	})

	const fieldErrors = reactive({
		name: '',
		email: '',
		phone_number: '',
		password: '',
		password_confirmation: '',
		roles: '',
		addresses: '',
		addressCities: [] as string[],
		addressTexts: [] as string[]
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			email: '',
			phone_number: '',
			password: '',
			password_confirmation: '',
			roles: [],
			addresses: [emptyAddress()]
		})
		triedSubmit.value = false
		selectedRoleName.value = null
		fieldErrors.name = ''
		fieldErrors.email = ''
		fieldErrors.phone_number = ''
		fieldErrors.password = ''
		fieldErrors.password_confirmation = ''
		fieldErrors.roles = ''
		fieldErrors.addresses = ''
		fieldErrors.addressCities = ['']
		fieldErrors.addressTexts = ['']
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.email = ''
		fieldErrors.phone_number = ''
		fieldErrors.password = ''
		fieldErrors.password_confirmation = ''
		fieldErrors.roles = ''
		fieldErrors.addresses = ''

		const addresses = form.addresses || []
		fieldErrors.addressCities = addresses.map(() => '')
		fieldErrors.addressTexts = addresses.map(() => '')

		let ok = true

		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите имя'
			ok = false
		}

		const email = form.email.trim()
		if (!email) {
			fieldErrors.email = 'Укажите email'
			ok = false
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			fieldErrors.email = 'Некорректный email'
			ok = false
		}

		if (!form.phone_number.trim()) {
			fieldErrors.phone_number = 'Укажите телефон'
			ok = false
		}

		const isCreate = !form.id
		const password = form.password || ''
		const passwordConfirmation = form.password_confirmation || ''
		if (isCreate && !password) {
			fieldErrors.password = 'Укажите пароль'
			ok = false
		}
		if (password || passwordConfirmation) {
			if (password.length < 8) {
				fieldErrors.password = 'Пароль минимум 8 символов'
				ok = false
			}
			if (password !== passwordConfirmation) {
				fieldErrors.password_confirmation = 'Пароли не совпадают'
				ok = false
			}
		}

		addresses.forEach((a, idx) => {
			if (!String(a.city || '').trim()) {
				fieldErrors.addressCities[idx] = 'Укажите город'
				ok = false
			}
			if (!String(a.address || '').trim()) {
				fieldErrors.addressTexts[idx] = 'Укажите адрес'
				ok = false
			}
		})

		if (addresses.length && !addresses.some((a) => a.is_default)) {
			fieldErrors.addresses = 'Выберите адрес по умолчанию'
			ok = false
		}

		return ok
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
			if (!open) {
				resetLocalForm()
				return
			}
			triedSubmit.value = false
			loadRoles()
		},
		{ immediate: true }
	)

	watch(
		() => props.user,
		(user) => {
			if (!user) return
			const addresses = Array.isArray(user.addresses) && user.addresses.length ? user.addresses : [emptyAddress()]
			Object.assign(form, {
				id: user.id ?? null,
				name: user.name ?? '',
				email: user.email ?? '',
				phone_number: user.phone_number ?? '',
				password: '',
				password_confirmation: '',
				roles: Array.isArray(user.roles) ? user.roles : [],
				addresses
			})
			fieldErrors.addressCities = addresses.map(() => '')
			fieldErrors.addressTexts = addresses.map(() => '')
			fieldErrors.name = ''
			fieldErrors.email = ''
			fieldErrors.phone_number = ''
			fieldErrors.password = ''
			fieldErrors.password_confirmation = ''
			fieldErrors.roles = ''
			fieldErrors.addresses = ''
		},
		{ immediate: true }
	)

	const roleOptions = computed(() =>
		allRoles.value
			.map((r) => r.name)
			.filter((name): name is string => typeof name === 'string' && name.length > 0)
			.filter((name) => !(form.roles || []).includes(name))
			.map((name) => ({ label: name, value: name }))
	)

	const addRole = (value: string | number | null) => {
		selectedRoleName.value = null
		if (!value) return
		const name = String(value)
		if (!(form.roles || []).includes(name)) form.roles = [...(form.roles || []), name]
	}

	const removeRole = (name: string) => {
		form.roles = (form.roles || []).filter((r) => r !== name)
	}

	const addAddress = () => {
		const next: UserAddress = {
			address: '',
			city: '',
			is_default: false
		}
		form.addresses = [...(form.addresses || []), next]
		fieldErrors.addressCities = [...(fieldErrors.addressCities || []), '']
		fieldErrors.addressTexts = [...(fieldErrors.addressTexts || []), '']
	}

	const removeAddress = (index: number) => {
		form.addresses = (form.addresses || []).filter((_, idx) => idx !== index)
		fieldErrors.addressCities = (fieldErrors.addressCities || []).filter((_, idx) => idx !== index)
		fieldErrors.addressTexts = (fieldErrors.addressTexts || []).filter((_, idx) => idx !== index)
	}

	const setDefaultAddress = (index: number, value: boolean) => {
		if (!value) {
			const addresses = [...(form.addresses || [])]
			addresses[index] = { ...addresses[index], is_default: false }
			form.addresses = addresses
			return
		}
		const addresses = (form.addresses || []).map((a, idx) => ({
			...a,
			is_default: idx === index
		}))
		form.addresses = addresses
	}

	const onSubmit = async () => {
		triedSubmit.value = true
		if (!validate()) {
			const first =
				fieldErrors.name ||
				fieldErrors.email ||
				fieldErrors.phone_number ||
				fieldErrors.password ||
				fieldErrors.password_confirmation ||
				fieldErrors.addresses ||
				fieldErrors.addressCities.find(Boolean) ||
				fieldErrors.addressTexts.find(Boolean)
			if (first) toast.error(first)
			return
		}

		saving.value = true
		try {
			const payload: User = {
				id: form.id ?? null,
				name: form.name.trim(),
				email: form.email.trim(),
				phone_number: form.phone_number.trim(),
				password: form.password || '',
				password_confirmation: form.password_confirmation || '',
				roles: form.roles || [],
				addresses: form.addresses || []
			}
			if (payload.id) {
				await usersApi.updateUser(payload)
			} else {
				await usersApi.createUser(payload)
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
				<TextField
					v-model="form.name"
					label="Имя *"
					name="name"
					placeholder="Имя"
					:error-message="triedSubmit ? fieldErrors.name : ''"
				/>
				<TextField
					v-model="form.email"
					label="Email *"
					type="email"
					name="email"
					placeholder="Email"
					:error-message="triedSubmit ? fieldErrors.email : ''"
				/>
				<TextField
					v-model="form.phone_number"
					label="Телефон *"
					type="tel"
					name="phone_number"
					placeholder="Телефон"
					:error-message="triedSubmit ? fieldErrors.phone_number : ''"
				/>

				<TextField
					v-if="!user"
					v-model="form.password"
					label="Пароль *"
					name="password"
					type="password"
					placeholder="Пароль"
					:error-message="triedSubmit ? fieldErrors.password : ''"
				/>
				<TextField
					v-if="!user"
					v-model="form.password_confirmation"
					label="Подтверждение пароля *"
					name="password_confirmation"
					type="password"
					placeholder="Подтверждение пароля"
					:error-message="triedSubmit ? fieldErrors.password_confirmation : ''"
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
					<div v-if="(form.roles || []).length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="role in form.roles || []"
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
							v-for="(address, index) in form.addresses || []"
							:key="index"
							class="rounded-xl border border-gray-200 bg-white p-4"
						>
							<div class="flex items-start justify-between gap-3">
								<p class="text-sm font-semibold text-gray-800">Address #{{ index + 1 }}</p>
								<Button
									v-if="(form.addresses || []).length > 1"
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
								<TextField
									:model-value="address.city"
									label="Город"
									name="city"
									placeholder="Город"
									:error-message="triedSubmit ? fieldErrors.addressCities[index] : ''"
									@update:model-value="
										(v) => (form.addresses[index] = { ...form.addresses[index], city: String(v ?? '') })
									"
								/>
								<CheckboxField
									:model-value="address.is_default"
									label="По умолчанию"
									name="is_default"
									@update:model-value="(v) => setDefaultAddress(index, v)"
								/>

								<div class="md:col-span-3">
									<TextareaField
										:model-value="address.address"
										label="Адрес"
										name="address"
										placeholder="Адрес"
										:error-message="triedSubmit ? fieldErrors.addressTexts[index] : ''"
										@update:model-value="
											(v) =>
												(form.addresses[index] = { ...form.addresses[index], address: String(v ?? '') })
										"
									/>
								</div>
							</div>
						</div>
					</div>
					<p v-if="triedSubmit && fieldErrors.addresses" class="mt-2 text-sm text-red-600">{{ fieldErrors.addresses }}</p>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
