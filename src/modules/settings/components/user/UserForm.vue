<script setup lang="ts">
	import { computed, onMounted, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import CloseEye from '@/shared/icons/CloseEye.vue'
	import Eye from '@/shared/icons/Eye.vue'
	import { api } from '../../api'
	import type { Role, User } from '../../types'

	const emit = defineEmits<{ (e: 'saved'): void; (e: 'cancel'): void }>()
	const props = defineProps<{ user?: User | null }>()

	const saving = ref(false)
	const triedSubmit = ref(false)
	const loadingRoles = ref(false)
	const allRoles = ref<Role[]>([])
	const selectedRoleName = ref<string | null>(null)

	const isEdit = computed(() => !!props.user?.id)

	const showPassword = ref(false)
	const showPasswordConfirmation = ref(false)

	const togglePasswordVisibility = () => {
		showPassword.value = !showPassword.value
	}

	const togglePasswordConfirmationVisibility = () => {
		showPasswordConfirmation.value = !showPasswordConfirmation.value
	}

	const form = reactive({
		id: null as number | null,
		name: '',
		first_name: '',
		last_name: '',
		admin_comment: '',
		is_tax_exempt: false,
		email: '',
		phone_number: '',
		is_active: true,
		password: '',
		password_confirmation: '',
		roles: [] as string[]
	})

	const fieldErrors = reactive({
		name: '',
		email: '',
		password: '',
		password_confirmation: '',
		roles: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			first_name: '',
			last_name: '',
			admin_comment: '',
			is_tax_exempt: false,
			email: '',
			phone_number: '',
			is_active: true,
			password: '',
			password_confirmation: '',
			roles: []
		})
		triedSubmit.value = false
		selectedRoleName.value = null
		showPassword.value = false
		showPasswordConfirmation.value = false
		fieldErrors.name = ''
		fieldErrors.email = ''
		fieldErrors.password = ''
		fieldErrors.password_confirmation = ''
		fieldErrors.roles = ''
	}

	const populateFromUser = (user: User) => {
		showPassword.value = false
		showPasswordConfirmation.value = false
		Object.assign(form, {
			id: user.id ?? null,
			name: user.name ?? '',
			first_name: user.first_name ?? '',
			last_name: user.last_name ?? '',
			admin_comment: user.admin_comment ?? '',
			is_tax_exempt: !!user.is_tax_exempt,
			email: user.email ?? '',
			phone_number: user.phone_number ?? '',
			is_active: user.is_active ?? true,
			password: '',
			password_confirmation: '',
			roles: Array.isArray(user.roles) ? [...user.roles] : []
		})
		fieldErrors.name = ''
		fieldErrors.email = ''
		fieldErrors.password = ''
		fieldErrors.password_confirmation = ''
		fieldErrors.roles = ''
	}

	const validate = () => {
		fieldErrors.name = ''
		fieldErrors.email = ''
		fieldErrors.password = ''
		fieldErrors.password_confirmation = ''
		fieldErrors.roles = ''

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

		return ok
	}

	const loadRoles = async () => {
		loadingRoles.value = true
		try {
			const result = await api.listRoles({ limit: 1000, offset: 0 })
			allRoles.value = result.items || []
		} finally {
			loadingRoles.value = false
		}
	}

	watch(
		() => props.user,
		(user) => {
			triedSubmit.value = false
			if (user) populateFromUser(user)
			else resetLocalForm()
		},
		{ immediate: true }
	)

	onMounted(loadRoles)

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

	const onSubmit = async () => {
		triedSubmit.value = true
		if (!validate()) {
			const first = fieldErrors.name || fieldErrors.email || fieldErrors.password || fieldErrors.password_confirmation
			if (first) toast.error(first)
			return
		}

		saving.value = true
		try {
			const payload: User = {
				id: form.id ?? null,
				name: form.name.trim(),
				first_name: form.first_name.trim(),
				last_name: form.last_name.trim(),
				admin_comment: form.admin_comment.trim(),
				is_tax_exempt: !!form.is_tax_exempt,
				email: form.email.trim(),
				phone_number: form.phone_number.trim(),
				is_active: !!form.is_active,
				password: form.password || '',
				password_confirmation: form.password_confirmation || '',
				roles: form.roles || []
			}

			if (payload.id) await api.updateUser(payload)
			else await api.createUser(payload)

			toast.success('Пользователь сохранён')
			emit('saved')
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
	<form class="grid grid-cols-1 gap-4 md:grid-cols-3" @submit.prevent="onSubmit">
		<TextField
			v-model="form.name"
			label="Имя"
			required
			name="name"
			placeholder="Имя"
			:error-message="triedSubmit ? fieldErrors.name : ''"
		/>
		<TextField v-model="form.first_name" label="Имя (first_name)" name="first_name" placeholder="Необязательно" />
		<TextField v-model="form.last_name" label="Фамилия (last_name)" name="last_name" placeholder="Необязательно" />

		<TextField
			v-model="form.email"
			label="Email"
			required
			type="email"
			name="email"
			placeholder="user@example.com"
			:error-message="triedSubmit ? fieldErrors.email : ''"
		/>
		<TextField v-model="form.phone_number" label="Телефон" type="tel" name="phone_number" placeholder="Необязательно" />

		<div class="flex flex-col gap-3 md:col-span-1">
			<CheckboxField v-model="form.is_active" label="Активен" name="is_active" />
			<CheckboxField v-model="form.is_tax_exempt" label="Освобождён от налога" name="is_tax_exempt" />
		</div>

		<div class="md:col-span-3">
			<TextareaField
				v-model="form.admin_comment"
				label="Комментарий администратора"
				name="admin_comment"
				placeholder="Необязательно"
			/>
		</div>

		<template v-if="!isEdit">
			<TextField
				v-model="form.password"
				label="Пароль"
				required
				name="password"
				:type="showPassword ? 'text' : 'password'"
				placeholder="Пароль"
				:error-message="triedSubmit ? fieldErrors.password : ''"
				:prepend-icon="showPassword ? CloseEye : Eye"
				@toggle-prepend-icon="togglePasswordVisibility"
			/>
			<TextField
				v-model="form.password_confirmation"
				label="Подтверждение пароля"
				required
				name="password_confirmation"
				:type="showPasswordConfirmation ? 'text' : 'password'"
				placeholder="Подтверждение пароля"
				:error-message="triedSubmit ? fieldErrors.password_confirmation : ''"
				:prepend-icon="showPasswordConfirmation ? CloseEye : Eye"
				@toggle-prepend-icon="togglePasswordConfirmationVisibility"
			/>
		</template>

		<template v-else>
			<TextField
				v-model="form.password"
				label="Новый пароль"
				name="password"
				:type="showPassword ? 'text' : 'password'"
				placeholder="Оставьте пустым, если не меняете"
				:error-message="triedSubmit ? fieldErrors.password : ''"
				:prepend-icon="showPassword ? CloseEye : Eye"
				@toggle-prepend-icon="togglePasswordVisibility"
			/>
			<TextField
				v-model="form.password_confirmation"
				label="Подтверждение пароля"
				name="password_confirmation"
				:type="showPasswordConfirmation ? 'text' : 'password'"
				placeholder="Подтверждение пароля"
				:error-message="triedSubmit ? fieldErrors.password_confirmation : ''"
				:prepend-icon="showPasswordConfirmation ? CloseEye : Eye"
				@toggle-prepend-icon="togglePasswordConfirmationVisibility"
			/>
		</template>

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

		<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" variant="outline" size="sm" :on-click="() => $emit('cancel')"> Отмена </Button>
			<Button type="submit" size="sm" :disabled="saving" :loading="saving">
				{{ saving ? 'Сохранение...' : 'Сохранить' }}
			</Button>
		</div>
	</form>
</template>
