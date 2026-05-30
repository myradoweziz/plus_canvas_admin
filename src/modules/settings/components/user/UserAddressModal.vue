<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../../api'
	import type { User, UserProfileAddress } from '../../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{
		open: boolean
		userId: number
		address?: UserProfileAddress | null
		user?: User | null
	}>()

	const saving = ref(false)
	const triedSubmit = ref(false)

	const form = reactive({
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		fax_number: '',
		address: '',
		city: '',
		is_default: false
	})

	const fieldErrors = reactive({
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		fax_number: '',
		address: '',
		city: ''
	})

	const resetFieldErrors = () => {
		fieldErrors.first_name = ''
		fieldErrors.last_name = ''
		fieldErrors.email = ''
		fieldErrors.phone_number = ''
		fieldErrors.fax_number = ''
		fieldErrors.address = ''
		fieldErrors.city = ''
	}

	const resetLocalForm = () => {
		Object.assign(form, {
			first_name: '',
			last_name: '',
			email: '',
			phone_number: '',
			fax_number: '',
			address: '',
			city: '',
			is_default: false
		})
		resetFieldErrors()
		triedSubmit.value = false
	}

	const fillFromUser = () => {
		if (!props.user) return
		form.first_name = props.user.first_name?.trim() || ''
		form.last_name = props.user.last_name?.trim() || ''
		form.email = props.user.email?.trim() || ''
		form.phone_number = props.user.phone_number?.trim() || ''
	}

	const validate = () => {
		resetFieldErrors()
		let ok = true

		if (!form.first_name.trim()) {
			fieldErrors.first_name = 'Укажите имя'
			ok = false
		}
		if (!form.last_name.trim()) {
			fieldErrors.last_name = 'Укажите фамилию'
			ok = false
		}
		if (!form.email.trim()) {
			fieldErrors.email = 'Укажите email'
			ok = false
		}
		if (!form.address.trim()) {
			fieldErrors.address = 'Укажите адрес'
			ok = false
		}
		if (!form.city.trim()) {
			fieldErrors.city = 'Укажите город'
			ok = false
		}

		return ok
	}

	watch(
		() => [props.open, props.address] as const,
		([open, address]) => {
			if (!open) {
				resetLocalForm()
				return
			}

			triedSubmit.value = false
			resetFieldErrors()

			if (address) {
				Object.assign(form, {
					first_name: address.first_name,
					last_name: address.last_name,
					email: address.email,
					phone_number: address.phone_number,
					fax_number: address.fax_number,
					address: address.address,
					city: address.city,
					is_default: address.is_default
				})
				return
			}

			resetLocalForm()
			fillFromUser()
		}
	)

	const onSubmit = async () => {
		triedSubmit.value = true
		if (!validate()) return

		const payload = {
			first_name: form.first_name.trim(),
			last_name: form.last_name.trim(),
			email: form.email.trim(),
			phone_number: form.phone_number.trim(),
			fax_number: form.fax_number.trim(),
			address: form.address.trim(),
			city: form.city.trim(),
			is_default: form.is_default
		}

		saving.value = true
		try {
			if (props.address?.id) {
				await api.updateUserAddress(props.userId, props.address.id, payload)
				toast.success('Адрес обновлён')
			} else {
				await api.createUserAddress(props.userId, payload)
				toast.success('Адрес добавлен')
			}
			emit('saved')
			emit('close')
			resetLocalForm()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else toast.error(props.address ? 'Не удалось обновить адрес' : 'Не удалось добавить адрес')
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
						{{ props.address ? 'Редактировать адрес' : 'Добавить адрес' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.first_name"
					label="Имя"
					required
					name="first_name"
					placeholder="Имя"
					:error-message="triedSubmit ? fieldErrors.first_name : ''"
				/>

				<TextField
					v-model="form.last_name"
					label="Фамилия"
					required
					name="last_name"
					placeholder="Фамилия"
					:error-message="triedSubmit ? fieldErrors.last_name : ''"
				/>

				<TextField
					v-model="form.email"
					label="Email"
					required
					name="email"
					type="email"
					placeholder="email@example.com"
					:error-message="triedSubmit ? fieldErrors.email : ''"
				/>

				<TextField
					v-model="form.phone_number"
					label="Телефон"
					name="phone_number"
					placeholder="+7 ..."
					:error-message="triedSubmit ? fieldErrors.phone_number : ''"
				/>

				<TextField
					v-model="form.fax_number"
					label="Факс"
					name="fax_number"
					placeholder="Факс"
					:error-message="triedSubmit ? fieldErrors.fax_number : ''"
				/>

				<TextField
					v-model="form.city"
					label="Город"
					required
					name="city"
					placeholder="Город"
					:error-message="triedSubmit ? fieldErrors.city : ''"
				/>

				<div class="md:col-span-2">
					<TextField
						v-model="form.address"
						label="Адрес"
						required
						name="address"
						placeholder="Улица, дом"
						:error-message="triedSubmit ? fieldErrors.address : ''"
					/>
				</div>

				<div class="md:col-span-2">
					<CheckboxField v-model="form.is_default" label="Адрес по умолчанию" name="is_default" />
				</div>

				<div class="flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
