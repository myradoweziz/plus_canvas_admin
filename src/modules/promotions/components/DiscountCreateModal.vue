<script setup lang="ts">
	import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { api as categoriesApi } from '@/modules/categories/api'
	import type { FeaturedCategory, SubCategory } from '@/modules/categories/types'
	import { api as configurationApi } from '@/modules/configuration/api'
	import type { NameSlugEntity } from '@/modules/configuration/types'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { TurkishLiraIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Discount } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; discount: Discount | null }>()

	const saving = ref(false)
	const loadingDictionaries = ref(false)
	const dictionariesRequestId = ref(0)
	const discountTypes = ref<NameSlugEntity[]>([])
	const discountLimitations = ref<NameSlugEntity[]>([])
	const featuredCategories = ref<FeaturedCategory[]>([])
	const subCategories = ref<SubCategory[]>([])
	const selectedFeaturedCategoryId = ref<number | null>(null)
	const selectedSubCategoryId = ref<number | null>(null)

	const form = reactive({
		id: null as number | null,
		name: '',
		discount_type_id: null as number | null,
		is_percentage: true,
		amount: 0 as number | string,
		start_date: '',
		end_date: '',
		requires_promo_code: false,
		promo_code: '',
		discount_limitation_id: null as number | null,
		usage_limit: 0 as number | string,
		requirement_type: '',
		min_order_amount: 0 as number | string,
		target_categories: [] as number[],
		target_sub_categories: [] as number[]
	})

	const fieldErrors = reactive({
		name: '',
		discount_type_id: '',
		amount: '',
		start_date: '',
		end_date: '',
		promo_code: '',
		discount_limitation_id: '',
		usage_limit: '',
		requirement_type: '',
		min_order_amount: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			discount_type_id: null,
			is_percentage: true,
			amount: 0,
			start_date: '',
			end_date: '',
			requires_promo_code: false,
			promo_code: '',
			discount_limitation_id: null,
			usage_limit: 0,
			requirement_type: '',
			min_order_amount: 0,
			target_categories: [],
			target_sub_categories: []
		})
		selectedFeaturedCategoryId.value = null
		selectedSubCategoryId.value = null
		subCategories.value = []
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
	}

	const discountTypeOptions = computed(() =>
		discountTypes.value
			.filter((item): item is NameSlugEntity & { id: number } => item.id !== null)
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const discountLimitationOptions = computed(() =>
		discountLimitations.value
			.filter((item): item is NameSlugEntity & { id: number } => item.id !== null)
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const featuredCategoryOptions = computed(() =>
		featuredCategories.value
			.filter((item): item is FeaturedCategory & { id: number } => item.id !== null)
			.filter((item) => !form.target_categories.includes(item.id))
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const subCategoryOptions = computed(() =>
		subCategories.value
			.filter((item): item is SubCategory & { id: number } => item.id !== null)
			.filter((item) => !form.target_sub_categories.includes(item.id))
			.map((item) => ({ label: item.name, value: item.id }))
	)

	const selectedFeaturedCategories = computed(() =>
		form.target_categories.map((id) => ({
			id,
			label: featuredCategories.value.find((item) => item.id === id)?.name ?? `#${id}`
		}))
	)

	const selectedSubCategories = computed(() =>
		form.target_sub_categories.map((id) => ({
			id,
			label: subCategories.value.find((item) => item.id === id)?.name ?? `#${id}`
		}))
	)

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.discount_type_id) {
			fieldErrors.discount_type_id = 'Выберите тип скидки'
			ok = false
		}
		const amount = Number(form.amount)
		if (!Number.isFinite(amount) || amount < 0) {
			fieldErrors.amount = 'Укажите корректный размер скидки'
			ok = false
		}
		if (!form.start_date) {
			fieldErrors.start_date = 'Укажите дату начала'
			ok = false
		}
		if (!form.end_date) {
			fieldErrors.end_date = 'Укажите дату окончания'
			ok = false
		}
		if (form.requires_promo_code && !form.promo_code.trim()) {
			fieldErrors.promo_code = 'Укажите промокод'
			ok = false
		}
		if (!form.discount_limitation_id) {
			fieldErrors.discount_limitation_id = 'Выберите ограничение скидки'
			ok = false
		}
		const usageLimit = Number(form.usage_limit)
		if (!Number.isFinite(usageLimit) || usageLimit < 0) {
			fieldErrors.usage_limit = 'Укажите корректный лимит использования'
			ok = false
		}
		const minOrderAmount = Number(form.min_order_amount)
		if (!Number.isFinite(minOrderAmount) || minOrderAmount < 0) {
			fieldErrors.min_order_amount = 'Укажите корректную минимальную сумму заказа'
			ok = false
		}
		return ok
	}

	const loadDictionaries = async () => {
		const requestId = dictionariesRequestId.value + 1
		dictionariesRequestId.value = requestId
		loadingDictionaries.value = true
		try {
			const [types, limitations, featuredResult, subResult] = await Promise.all([
				configurationApi.listDiscountTypes(),
				configurationApi.listDiscountLimitations(),
				categoriesApi.listFeaturedCategories({ limit: 500, offset: 0 }),
				categoriesApi.listSubCategories({ limit: 500, offset: 0 })
			])
			if (requestId !== dictionariesRequestId.value) return
			discountTypes.value = types
			discountLimitations.value = limitations
			featuredCategories.value = featuredResult.items || []
			subCategories.value = subResult.items || []
		} finally {
			if (requestId === dictionariesRequestId.value) {
				loadingDictionaries.value = false
			}
		}
	}

	const addFeaturedCategory = (value: string | number | null) => {
		selectedFeaturedCategoryId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.target_categories.includes(id)) {
			form.target_categories.push(id)
		}
	}

	const removeFeaturedCategory = (id: number) => {
		form.target_categories = form.target_categories.filter((item) => item !== id)
	}

	const addSubCategory = (value: string | number | null) => {
		selectedSubCategoryId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.target_sub_categories.includes(id)) {
			form.target_sub_categories.push(id)
		}
	}

	const removeSubCategory = (id: number) => {
		form.target_sub_categories = form.target_sub_categories.filter((item) => item !== id)
	}

	watch(
		() => [props.open, props.discount] as const,
		([open, discount]) => {
			if (!open) return
			if (!discount) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: discount.id ?? null,
				name: discount.name ?? '',
				discount_type_id: discount.discount_type_id,
				is_percentage: !!discount.is_percentage,
				amount: discount.amount ?? 0,
				start_date: discount.start_date ?? '',
				end_date: discount.end_date ?? '',
				requires_promo_code: !!discount.requires_promo_code,
				promo_code: discount.promo_code ?? '',
				discount_limitation_id: discount.discount_limitation_id,
				usage_limit: discount.usage_limit ?? 0,
				requirement_type: discount.requirement_type ?? '',
				min_order_amount: discount.min_order_amount ?? 0,
				target_categories: [...(discount.target_categories ?? [])],
				target_sub_categories: [...(discount.target_sub_categories ?? [])]
			})
			selectedFeaturedCategoryId.value = null
			selectedSubCategoryId.value = null
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
			const payload: Discount = {
				id: form.id ?? null,
				name: form.name.trim(),
				discount_type_id: form.discount_type_id,
				is_percentage: form.is_percentage,
				amount: Number(form.amount) || 0,
				start_date: form.start_date,
				end_date: form.end_date,
				requires_promo_code: form.requires_promo_code,
				promo_code: form.promo_code.trim(),
				discount_limitation_id: form.discount_limitation_id,
				usage_limit: Number(form.usage_limit) || 0,
				requirement_type: form.requirement_type.trim(),
				min_order_amount: Number(form.min_order_amount) || 0,
				target_categories: [...form.target_categories],
				target_sub_categories: [...form.target_sub_categories]
			}

			if (payload.id) {
				await api.updateDiscount(payload)
				toast.success('Скидка обновлена')
			} else {
				await api.createDiscount(payload)
				toast.success('Скидка добавлена')
			}

			emit('saved')
			emit('close')

			if (!props.discount) resetLocalForm()
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
			class="relative z-[100000] mx-auto h-[90vh] w-[92vw] max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
		>
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ discount ? 'Редактировать скидку' : 'Добавить скидку' }}
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
						v-model="form.name"
						label="Название"
						required
						name="name"
						placeholder="Название"
						:error-message="fieldErrors.name"
					/>
				</div>

				<SelectField
					v-model="form.discount_type_id"
					label="Тип скидки"
					required
					name="discount_type_id"
					placeholder="Выберите тип скидки"
					:options="discountTypeOptions"
					:disabled="loadingDictionaries"
					:error-message="fieldErrors.discount_type_id"
				/>

				<SelectField
					v-model="form.discount_limitation_id"
					label="Ограничение скидки"
					required
					name="discount_limitation_id"
					placeholder="Выберите ограничение"
					:options="discountLimitationOptions"
					:disabled="loadingDictionaries"
					:error-message="fieldErrors.discount_limitation_id"
				/>

				<TextField
					v-model.number="form.amount"
					label="Размер скидки"
					required
					name="amount"
					type="number"
					min="0"
					step="0.01"
					:error-message="fieldErrors.amount"
				/>

				<TextField
					v-model.number="form.usage_limit"
					label="Лимит использования"
					required
					name="usage_limit"
					type="number"
					min="0"
					:error-message="fieldErrors.usage_limit"
				/>

				<TextField
					v-model="form.requirement_type"
					label="Requirement type"
					name="requirement_type"
					placeholder="Requirement type"
					:error-message="fieldErrors.requirement_type"
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
					v-model="form.start_date"
					label="Дата начала"
					required
					name="start_date"
					type="datetime-local"
					:error-message="fieldErrors.start_date"
				/>

				<TextField
					v-model="form.end_date"
					label="Дата окончания"
					required
					name="end_date"
					type="datetime-local"
					:error-message="fieldErrors.end_date"
				/>

				<CheckboxField
					v-model="form.is_percentage"
					label="Процентная скидка"
					name="is_percentage"
					class="md:col-span-1"
				/>

				<CheckboxField
					v-model="form.requires_promo_code"
					label="Требуется промокод"
					name="requires_promo_code"
					class="md:col-span-1"
				/>

				<div class="md:col-span-2">
					<TextField
						v-model="form.promo_code"
						label="Промокод"
						name="promo_code"
						placeholder="PROMO2026"
						:required="form.requires_promo_code"
						:disabled="!form.requires_promo_code"
						:error-message="fieldErrors.promo_code"
					/>
				</div>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedFeaturedCategoryId"
						label="Категории"
						name="target_categories"
						placeholder="Выберите категорию"
						:options="featuredCategoryOptions"
						:disabled="loadingDictionaries"
						@update:model-value="addFeaturedCategory"
					/>
					<div v-if="selectedFeaturedCategories.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="category in selectedFeaturedCategories"
							:key="category.id"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							{{ category.label }}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removeFeaturedCategory(category.id)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedSubCategoryId"
						label="Подкategории"
						name="target_sub_categories"
						placeholder="Выберите подкатегорию"
						:options="subCategoryOptions"
						:disabled="loadingDictionaries"
						@update:model-value="addSubCategory"
					/>
					<div v-if="selectedSubCategories.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="category in selectedSubCategories"
							:key="category.id"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							{{ category.label }}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:on-click="() => removeSubCategory(category.id)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

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
