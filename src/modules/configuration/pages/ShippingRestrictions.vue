<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import ShippingRestrictionsTable from '../components/ShippingRestrictionsTable.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { CountriesIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { ShippingMethodRestrictionRow } from '../types'

	const loading = ref(false)
	const saving = ref(false)
	const rows = ref<ShippingMethodRestrictionRow[]>([])

	const restrictedCount = computed(() => rows.value.filter((row) => row.is_restricted).length)

	const load = async () => {
		loading.value = true
		try {
			const [restrictions, countries] = await Promise.all([
				api.getShippingMethodRestrictions(),
				api.listAllCountries()
			])

			const restrictionMap = new Map(restrictions.map((item) => [item.country_id, item.is_restricted]))

			rows.value = countries
				.filter((country) => country.id != null)
				.map((country) => ({
					country_id: country.id as number,
					country_name: country.name,
					two_letter_iso_code: country.two_letter_iso_code,
					is_restricted: restrictionMap.get(country.id as number) ?? false
				}))
				.sort((a, b) => a.country_name.localeCompare(b.country_name, 'ru'))
		} catch (err) {
			rows.value = []
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else toast.error('Не удалось загрузить ограничения доставки')
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const updateRestriction = (countryId: number, value: boolean) => {
		const row = rows.value.find((item) => item.country_id === countryId)
		if (row) row.is_restricted = value
	}

	const save = async () => {
		saving.value = true
		try {
			await api.updateShippingMethodRestrictions({
				restrictions: rows.value.map((row) => ({
					country_id: row.country_id,
					is_restricted: row.is_restricted
				}))
			})
			toast.success('Ограничения доставки сохранены')
			await load()
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
		<Banner
			title="Ограничения доставки по странам"
			subtitle="Отметьте страны, для которых доставка ограничена, и сохраните изменения."
			:icon="CountriesIcon"
			:total="rows.length"
		>
			<template #actions>
				<Button type="button" size="sm" :disabled="loading || saving" :loading="saving" :on-click="save">
					Сохранить
				</Button>
			</template>
		</Banner>

		<p v-if="!loading && rows.length" class="text-sm text-gray-600">
			Ограничено: {{ restrictedCount }} из {{ rows.length }}
		</p>

		<ShippingRestrictionsTable
			:items="rows"
			:loading="loading"
			:disabled="loading || saving"
			@update:is-restricted="updateRestriction"
		/>
	</div>
</template>
