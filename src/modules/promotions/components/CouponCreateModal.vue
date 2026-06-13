<script setup lang="ts">
	import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { api as configurationApi } from '@/modules/configuration/api'
	import type { NameSlugEntity } from '@/modules/configuration/types'
	import { api as usersApi } from '@/modules/settings/api'
	import type { User } from '@/modules/settings/types/user'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { TurkishLiraIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Coupon } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; coupon: Coupon | null }>()

	const saving = ref(false)
	const loadingDictionaries = ref(false)
	const dictionariesRequestId = ref(0)
	const discountTypes = ref<NameSlugEntity[]>([])
	const users = ref<User[]>([])
	const selectedUserId = ref<number | null>(null)

	const form = reactive({
		id: null as number | null,
		code: '',
		discount_type_id: null as number | null,
		is_percentage: true,
		amount: 0 as number | string,
		min_order_amount: 0 as number | string,
		usage_limit: 0 as number | string,
		start_date: '',
		end_date: '',
		user_ids: [] as number[],
		is_active: true
	})

	const fieldErrors = reactive({
		code: '',
		discount_type_id: '',
		amount: '',
		min_order_amount: '',
		usage_limit: '',
		start_date: '',
		end_date: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			code: '',
			discount_type_id: null,
			is_percentage: true,
			amount: 0,
			min_order_amount: 0,
			usage_limit: 0,
			start_date: '',
			end_date: '',
			user_ids: [],
			is_active: true
		})
		selectedUserId.value = null
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
	}

	const discountTypeOptions = computed(() =>
		discountTypes.value
			.filter((item): item is NameSlugEntity & { id: number } => item.id !== null)
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const userOptions = computed(() =>
		users.value
			.filter((item): item is User & { id: number } => item.id !== null)
			.filter((item) => !form.user_ids.includes(item.id))
			.map((item) => ({
				label: item.email || item.name || `#${item.id}`,
				value: item.id
			}))
	)

	const selectedUsers = computed(() =>
		form.user_ids.map((id) => ({
			id,
			label: users.value.find((item) => item.id === id)?.email
				|| users.value.find((item) => item.id === id)?.name
				|| `#${id}`
		}))
	)

	const addUser = (value: string | number | null) => {
		selectedUserId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.user_ids.includes(id)) {
			form.user_ids.push(id)
		}
	}

	const removeUser = (id: number) => {
		form.user_ids = form.user_ids.filter((item) => item !== id)
	}

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.code.trim()) {
			fieldErrors.code = 'Укажите код купона'
			ok = false
		}
		if (!form.discount_type_id) {
			fieldErrors.discount_type_id = 'Выберите тип акции'
			ok = false
		}
		const amount = Number(form.amount)
		if (!Number.isFinite(amount) || amount < 0) {
			fieldErrors.amount = 'Укажите корректное значение скидки'
			ok = false
		}
		const minOrderAmount = Number(form.min_order_amount)
		if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
			fieldErrors.min_order_amount = 'Укажите корректную минимальную сумму заказа'
			ok = false
		}
		const usageLimit = Number(form.usage_limit)
		if (!Number.isFinite(usageLimit) || usageLimit < 0) {
			fieldErrors.usage_limit = 'Укажите корректный лимит использований'
			ok = false
		}

		return ok
	}

	const loadDictionaries = async () => {
		const requestId = dictionariesRequestId.value + 1
		dictionariesRequestId.value = requestId
		loadingDictionaries.value = true
		try {
			const [types, usersResult] = await Promise.all([
				configurationApi.listDiscountTypes(),
				usersApi.listUsers({ limit: 1000, offset: 0 })
			])
			if (requestId !== dictionariesRequestId.value) return
			discountTypes.value = types
			users.value = usersResult.items || []
		} finally {
			if (requestId === dictionariesRequestId.value) {
				loadingDictionaries.value = false
			}
		}
	}

	watch(
		() => [props.open, props.coupon] as const,
		([open, coupon]) => {
			if (!open) return
			if (!coupon) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: coupon.id ?? null,
				code: coupon.code ?? '',
				discount_type_id: coupon.discount_type_id,
				is_percentage: !!coupon.is_percentage,
				amount: coupon.amount ?? 0,
				min_order_amount: coupon.min_order_amount ?? 0,
				usage_limit: coupon.usage_limit ?? 0,
				start_date: coupon.start_date ?? '',
				end_date: coupon.end_date ?? '',
				user_ids: [...(coupon.user_ids ?? [])],
				is_active: coupon.is_active !== false
			})
			selectedUserId.value = null
			Object.keys(fieldErrors).forEach((key) => {
				fieldErrors[key as keyof typeof fieldErrors] = ''
			})
		},
		{ immediate: true }
	)

	watch(
		() => props.open,
		(open) => {
			if (open) loadDictionaries()
		},
		{ immediate: true }
	)

	onBeforeUnmount(() => {
		dictionariesRequestId.value += 1
	})

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Coupon = {
				id: form.id ?? null,
				code: form.code.trim(),
				discount_type_id: form.discount_type_id,
				is_percentage: form.is_percentage,
				amount: Number(form.amount) || 0,
				min_order_amount: Number(form.min_order_amount) || 0,
				usage_limit: Number(form.usage_limit) || 0,
				start_date: form.start_date || null,
				end_date: form.end_date || null,
				user_ids: [...form.user_ids],
				is_active: form.is_active
			}

			if (payload.id) {
				await api.updateCoupon(payload)
				toast.success('Купон обновлён')
			} else {
				await api.createCoupon(payload)
				toast.success('Купон добавлен')
			}

			emit('saved')
			emit('close')

			if (!props.coupon) resetLocalForm()
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
		<div class="relative z-[100000] mx-auto w-[92vw] max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ coupon ? 'Редактировать купон' : 'Добавить купон' }}
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
						v-model="form.code"
						label="Код купона"
						required
						name="code"
						placeholder="SUMMER2026"
						:error-message="fieldErrors.code"
					/>
				</div>

				<SelectField
					v-model="form.discount_type_id"
					label="Тип акции"
					required
					name="discount_type_id"
					placeholder="Выберите тип акции"
					:options="discountTypeOptions"
					:disabled="loadingDictionaries"
					:error-message="fieldErrors.discount_type_id"
				/>

				<TextField
					v-model.number="form.amount"
					label="Значение (% или ₺)"
					required
					name="amount"
					type="number"
					min="0"
					step="0.01"
					:error-message="fieldErrors.amount"
				/>

				<TextField
					v-model.number="form.min_order_amount"
					label="Мин. сумма заказа"
					name="min_order_amount"
					type="number"
					min="0"
					step="0.01"
					:append-icon="TurkishLiraIcon"
					:error-message="fieldErrors.min_order_amount"
				/>

				<TextField
					v-model.number="form.usage_limit"
					label="Лимит использований"
					name="usage_limit"
					type="number"
					min="0"
					step="1"
					:error-message="fieldErrors.usage_limit"
				/>

				<TextField
					v-model="form.start_date"
					label="Дата начала"
					name="start_date"
					type="datetime-local"
					:error-message="fieldErrors.start_date"
				/>

				<TextField
					v-model="form.end_date"
					label="Дата окончания"
					name="end_date"
					type="datetime-local"
					:error-message="fieldErrors.end_date"
				/>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedUserId"
						label="Пользователи"
						name="user_ids"
						placeholder="Выберите пользователя"
						:options="userOptions"
						:disabled="loadingDictionaries"
						@update:model-value="addUser"
					/>
					<div v-if="selectedUsers.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="user in selectedUsers"
							:key="user.id"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							{{ user.label }}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removeUser(user.id)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<CheckboxField
					v-model="form.is_percentage"
					label="Процентная скидка"
					name="is_percentage"
					class="md:col-span-2"
				/>

				<CheckboxField v-model="form.is_active" label="Активен" name="is_active" class="md:col-span-1" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
