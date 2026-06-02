<script setup lang="ts">
	import { computed, onMounted, reactive, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import CountryFormTabBar from './country-form/CountryFormTabBar.vue'
	import CountryStatesTab from './country-form/CountryStatesTab.vue'

	import { api as configurationApi } from '@/modules/configuration/api'
	import type { Store } from '@/modules/configuration/types'
	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import type { CountryFormTab } from '../helpers'
	import type { Country } from '../types'

	const route = useRoute()
	const router = useRouter()

	const countryId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const isEditMode = computed(() => countryId.value != null)
	const pageTitle = computed(() => (isEditMode.value ? 'Редактировать страну' : 'Добавить страну'))

	const activeTab = ref<CountryFormTab>('info')

	const loading = ref(false)
	const saving = ref(false)
	const loadingStores = ref(false)
	const stores = ref<Store[]>([])
	const selectedStoreId = ref<number | null>(null)

	const form = reactive({
		id: null as number | null,
		name: '',
		allows_billing: true,
		allows_shipping: true,
		two_letter_iso_code: '',
		three_letter_iso_code: '',
		numeric_iso_code: 0,
		subject_to_vat: false,
		published: true,
		limited_to_stores: false,
		store_ids: [] as number[],
		display_order: 0
	})

	const fieldErrors = reactive({
		name: '',
		two_letter_iso_code: '',
		three_letter_iso_code: '',
		numeric_iso_code: ''
	})

	const resetForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			allows_billing: true,
			allows_shipping: true,
			two_letter_iso_code: '',
			three_letter_iso_code: '',
			numeric_iso_code: 0,
			subject_to_vat: false,
			published: true,
			limited_to_stores: false,
			store_ids: [],
			display_order: 0
		})
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
	}

	const loadStores = async () => {
		loadingStores.value = true
		try {
			stores.value = (await configurationApi.listAllStores()).filter((item: Store) => item.id != null)
		} finally {
			loadingStores.value = false
		}
	}

	const storeOptions = computed(() =>
		stores.value
			.filter((store) => store.id != null && !form.store_ids.includes(store.id))
			.map((store) => ({
				label: store.name,
				value: store.id as number
			}))
	)

	const selectedStores = computed(() =>
		form.store_ids.map((id) => ({
			id,
			label: stores.value.find((store) => store.id === id)?.name ?? `#${id}`
		}))
	)

	const addStore = (value: string | number | null) => {
		selectedStoreId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.store_ids.includes(id)) {
			form.store_ids.push(id)
		}
	}

	const removeStore = (id: number) => {
		form.store_ids = form.store_ids.filter((item) => item !== id)
	}

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}

		const iso2 = form.two_letter_iso_code.trim().toUpperCase()
		if (!iso2) {
			fieldErrors.two_letter_iso_code = 'Укажите ISO-2 код'
			ok = false
		} else if (iso2.length !== 2) {
			fieldErrors.two_letter_iso_code = 'ISO-2 должен содержать 2 символа'
			ok = false
		}

		const iso3 = form.three_letter_iso_code.trim().toUpperCase()
		if (!iso3) {
			fieldErrors.three_letter_iso_code = 'Укажите ISO-3 код'
			ok = false
		} else if (iso3.length !== 3) {
			fieldErrors.three_letter_iso_code = 'ISO-3 должен содержать 3 символа'
			ok = false
		}

		const isoNumeric = Number(form.numeric_iso_code)
		if (!Number.isInteger(isoNumeric) || isoNumeric < 0) {
			fieldErrors.numeric_iso_code = 'Укажите корректный numeric ISO код'
			ok = false
		}

		return ok
	}

	const loadCountry = async () => {
		if (!countryId.value) return

		loading.value = true
		try {
			const country = await api.getCountryById(countryId.value)
			Object.assign(form, {
				id: country.id ?? null,
				name: country.name ?? '',
				allows_billing: !!country.allows_billing,
				allows_shipping: !!country.allows_shipping,
				two_letter_iso_code: country.two_letter_iso_code ?? '',
				three_letter_iso_code: country.three_letter_iso_code ?? '',
				numeric_iso_code: Number(country.numeric_iso_code) || 0,
				subject_to_vat: !!country.subject_to_vat,
				published: !!country.published,
				limited_to_stores: !!country.limited_to_stores,
				store_ids: Array.isArray(country.store_ids) ? country.store_ids : [],
				display_order: Number(country.display_order) || 0
			})
		} finally {
			loading.value = false
		}
	}

	onMounted(async () => {
		await loadStores()
		if (countryId.value) {
			await loadCountry()
		} else {
			resetForm()
			activeTab.value = 'info'
		}
	})

	watch(isEditMode, (edit) => {
		if (!edit && activeTab.value === 'states') {
			activeTab.value = 'info'
		}
	})

	watch(
		() => form.limited_to_stores,
		(value) => {
			if (!value) {
				form.store_ids = []
				selectedStoreId.value = null
			}
		}
	)

	const goBack = () => router.push('/admin-panel/configuration/countries')

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Country = {
				id: isEditMode.value ? countryId.value : null,
				name: form.name.trim(),
				allows_billing: !!form.allows_billing,
				allows_shipping: !!form.allows_shipping,
				two_letter_iso_code: form.two_letter_iso_code.trim().toUpperCase(),
				three_letter_iso_code: form.three_letter_iso_code.trim().toUpperCase(),
				numeric_iso_code: Number(form.numeric_iso_code) || 0,
				subject_to_vat: !!form.subject_to_vat,
				published: !!form.published,
				limited_to_stores: !!form.limited_to_stores,
				store_ids: form.limited_to_stores ? form.store_ids : [],
				display_order: Number(form.display_order) || 0
			}

			if (isEditMode.value) {
				await api.updateCountry(payload)
				toast.success('Страна обновлена')
			} else {
				await api.createCountry(payload)
				toast.success('Страна добавлена')
			}

			goBack()
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
	<div class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex items-start justify-between gap-4">
				<h3 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h3>

				<Button type="button" variant="outline" size="sm" :on-click="goBack">Назад</Button>
			</div>

			<div class="mt-6">
				<CountryFormTabBar v-model:active-tab="activeTab" :states-disabled="!isEditMode" />
			</div>

			<form v-show="activeTab === 'info'" class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<TextField
					v-model="form.name"
					label="Название"
					required
					name="name"
					placeholder="Название страны"
					:error-message="fieldErrors.name"
					:disabled="loading"
				/>

				<TextField
					v-model.number="form.display_order"
					label="Порядок отображения"
					name="display_order"
					type="number"
					min="0"
					step="1"
					:disabled="loading"
				/>

				<TextField
					v-model="form.two_letter_iso_code"
					label="ISO-2"
					required
					name="two_letter_iso_code"
					placeholder="UA"
					:error-message="fieldErrors.two_letter_iso_code"
					:disabled="loading"
				/>

				<TextField
					v-model="form.three_letter_iso_code"
					label="ISO-3"
					required
					name="three_letter_iso_code"
					placeholder="UKR"
					:error-message="fieldErrors.three_letter_iso_code"
					:disabled="loading"
				/>

				<TextField
					v-model.number="form.numeric_iso_code"
					label="Numeric ISO"
					required
					name="numeric_iso_code"
					type="number"
					min="0"
					step="1"
					:error-message="fieldErrors.numeric_iso_code"
					:disabled="loading"
				/>

				<div class="md:col-span-2 grid grid-cols-1 gap-3 md:grid-cols-2">
					<CheckboxField
						v-model="form.allows_billing"
						label="Разрешён биллинг"
						name="allows_billing"
						:disabled="loading"
					/>
					<CheckboxField
						v-model="form.allows_shipping"
						label="Разрешена доставка"
						name="allows_shipping"
						:disabled="loading"
					/>
					<CheckboxField
						v-model="form.subject_to_vat"
						label="Облагается НДС"
						name="subject_to_vat"
						:disabled="loading"
					/>
					<CheckboxField v-model="form.published" label="Опубликована" name="published" :disabled="loading" />
					<CheckboxField
						v-model="form.limited_to_stores"
						label="Ограничить магазинами"
						name="limited_to_stores"
						:disabled="loading"
					/>
				</div>

				<div class="md:col-span-2">
					<SelectField
						:model-value="selectedStoreId"
						label="Магазины"
						name="store_ids"
						placeholder="Выберите магазин"
						:options="storeOptions"
						:disabled="loading || loadingStores || !form.limited_to_stores"
						@update:model-value="addStore"
					/>
					<div v-if="selectedStores.length" class="mt-3 flex flex-wrap gap-2">
						<span
							v-for="store in selectedStores"
							:key="store.id"
							class="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
						>
							<span>{{ store.label }}</span>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class-name="h-5 w-5 text-gray-500 hover:text-red-600"
								:disabled="loading || !form.limited_to_stores"
								:on-click="() => removeStore(store.id)"
							>
								✕
							</Button>
						</span>
					</div>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" :on-click="goBack">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving || loading" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>

			<div v-show="activeTab === 'states'" class="mt-6">
				<CountryStatesTab v-if="isEditMode && countryId" :country-id="countryId" />
				<p v-else class="text-sm text-gray-600">Сначала сохраните страну, чтобы добавлять регионы.</p>
			</div>
		</div>
	</div>
</template>
