<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
import { computed, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

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

	const { errors, defineField, handleSubmit, resetForm, setFieldValue, setValues, values } = useForm({
		initialValues: {
			id: null as number | null,
			name: '',
			email: '',
			phone_number: '',
			password: '',
			password_confirmation: '',
			roles: [] as string[],
			addresses: [emptyAddress()]
		},
		validationSchema: toTypedSchema(
			z
				.object({
					id: z.number().nullable().optional(),
					name: z.string().trim().min(1, 'Укажите имя'),
					email: z.string().trim().min(1, 'Укажите email').email('Некорректный email'),
					phone_number: z.string().trim().min(1, 'Укажите телефон'),
					password: z.string().optional(),
					password_confirmation: z.string().optional(),
					roles: z.array(z.string()),
					addresses: z.array(
						z.object({
							address: z.string().trim().min(1, 'Укажите адрес'),
							city: z.string().trim().min(1, 'Укажите город'),
							is_default: z.boolean()
						})
					)
				})
				.superRefine((v, ctx) => {
					if (!v.id && !v.password) {
						ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'Укажите пароль' })
					}
					if (v.password || v.password_confirmation) {
						if ((v.password || '').length < 8) {
							ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['password'], message: 'Пароль минимум 8 символов' })
						}
						if (v.password !== v.password_confirmation) {
							ctx.addIssue({
								code: z.ZodIssueCode.custom,
								path: ['password_confirmation'],
								message: 'Пароли не совпадают'
							})
						}
					}
					if (v.addresses.length && !v.addresses.some((a) => a.is_default)) {
						ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['addresses'], message: 'Выберите адрес по умолчанию' })
					}
				})
		)
	})

	const [name, nameProps] = defineField('name')
	const [email, emailProps] = defineField('email')
	const [phoneNumber, phoneNumberProps] = defineField('phone_number')
	const [password, passwordProps] = defineField('password')
	const [passwordConfirmation, passwordConfirmationProps] = defineField('password_confirmation')

	const resetLocalForm = () => {
		resetForm({
			values: {
				id: null,
				name: '',
				email: '',
				phone_number: '',
				password: '',
				password_confirmation: '',
				roles: [],
				addresses: [emptyAddress()]
			}
		})
		triedSubmit.value = false
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
			setValues({
				id: user.id ?? null,
				name: user.name ?? '',
				email: user.email ?? '',
				phone_number: user.phone_number ?? '',
				password: '',
				password_confirmation: '',
				roles: Array.isArray(user.roles) ? user.roles : [],
				addresses: Array.isArray(user.addresses) && user.addresses.length ? user.addresses : [emptyAddress()]
			})
		},
		{ immediate: true }
	)

	const roleOptions = computed(() =>
		allRoles.value
			.map((r) => r.name)
			.filter((name): name is string => typeof name === 'string' && name.length > 0)
			.filter((name) => !(values.roles || []).includes(name))
			.map((name) => ({ label: name, value: name }))
	)

	const addRole = (value: string | number | null) => {
		selectedRoleName.value = null
		if (!value) return
		const name = String(value)
		if (!(values.roles || []).includes(name)) setValues({ ...values, roles: [...(values.roles || []), name] } as any)
	}

	const removeRole = (name: string) => {
		setValues({ ...values, roles: (values.roles || []).filter((r) => r !== name) } as any)
	}

	const addAddress = () => {
		const next: UserAddress = {
			address: '',
			city: '',
			is_default: false
		}
		setValues({ ...values, addresses: [...(values.addresses || []), next] } as any)
	}

	const removeAddress = (index: number) => {
		setValues({ ...values, addresses: (values.addresses || []).filter((_, idx) => idx !== index) } as any)
	}

	const setDefaultAddress = (index: number, value: boolean) => {
		if (!value) {
			const addresses = [...(values.addresses || [])]
			addresses[index] = { ...addresses[index], is_default: false }
			setValues({ ...values, addresses } as any)
			return
		}
		const addresses = (values.addresses || []).map((a, idx) => ({
			...a,
			is_default: idx === index
		}))
		setValues({ ...values, addresses } as any)
	}

	const onSubmit = handleSubmit(
		async (v) => {
			triedSubmit.value = true
			saving.value = true
			try {
				const payload: User = {
					id: v.id ?? null,
					name: v.name,
					email: v.email,
					phone_number: v.phone_number,
					password: v.password || '',
					password_confirmation: v.password_confirmation || '',
					roles: v.roles || [],
					addresses: v.addresses || []
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
		},
		() => {
			triedSubmit.value = true
		}
	)
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
					v-model="name"
					v-bind="nameProps"
					label="Имя *"
					name="name"
					placeholder="Имя"
					:error-message="errors.name"
				/>
				<TextField
					v-model="email"
					v-bind="emailProps"
					label="Email *"
					type="email"
					name="email"
					placeholder="Email"
					:error-message="errors.email"
				/>
				<TextField
					v-model="phoneNumber"
					v-bind="phoneNumberProps"
					label="Телефон *"
					type="tel"
					name="phone_number"
					placeholder="Телефон"
					:error-message="errors.phone_number"
				/>

				<TextField
					v-if="!user"
					v-model="password"
					v-bind="passwordProps"
					label="Пароль *"
					name="password"
					type="password"
					placeholder="Пароль"
					:error-message="errors.password"
				/>
				<TextField
					v-if="!user"
					v-model="passwordConfirmation"
					v-bind="passwordConfirmationProps"
					label="Подтверждение пароля *"
					name="password_confirmation"
					type="password"
					placeholder="Подтверждение пароля"
					:error-message="errors.password_confirmation"
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
					<div v-if="(values.roles || []).length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="role in values.roles || []"
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
							v-for="(address, index) in values.addresses || []"
							:key="index"
							class="rounded-xl border border-gray-200 bg-white p-4"
						>
							<div class="flex items-start justify-between gap-3">
								<p class="text-sm font-semibold text-gray-800">Address #{{ index + 1 }}</p>
								<Button
									v-if="(values.addresses || []).length > 1"
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
									:error-message="triedSubmit ? (errors as any)[`addresses[${index}].city`] : ''"
									@update:model-value="(v) => (setFieldValue as any)(`addresses[${index}].city`, String(v ?? ''))"
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
										:error-message="triedSubmit ? (errors as any)[`addresses[${index}].address`] : ''"
										@update:model-value="(v) => (setFieldValue as any)(`addresses[${index}].address`, String(v ?? ''))"
									/>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || Object.values(errors).some(Boolean)" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
