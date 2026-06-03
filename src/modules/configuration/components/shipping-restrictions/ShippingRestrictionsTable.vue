<script setup lang="ts">
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { SHIPPING_METHOD_RESTRICTIONS_TABLE_COLUMNS } from '../helpers'
	import type { ShippingMethodRestrictionRow } from '../types'

	defineProps<{
		items: ShippingMethodRestrictionRow[]
		loading: boolean
		disabled?: boolean
	}>()

	const emit = defineEmits<{
		(e: 'update:isRestricted', countryId: number, value: boolean): void
	}>()

	const toItem = (row: unknown) => row as ShippingMethodRestrictionRow
</script>

<template>
	<DataTable
		:columns="SHIPPING_METHOD_RESTRICTIONS_TABLE_COLUMNS"
		:rows="items"
		:loading="loading"
		empty-text="Страны не найдены."
		:pagination="{ limit: items.length || 1, offset: 0 }"
	>
		<template #cell-country_name="{ row }">
			<span class="font-medium text-gray-800">{{ toItem(row).country_name }}</span>
		</template>

		<template #cell-two_letter_iso_code="{ row }">
			<span class="text-gray-700">{{ toItem(row).two_letter_iso_code }}</span>
		</template>

		<template #cell-is_restricted="{ row }">
			<div class="flex justify-end">
				<CheckboxField
					:model-value="toItem(row).is_restricted"
					:disabled="disabled"
					:label="toItem(row).is_restricted ? 'Да' : 'Нет'"
					:name="`is_restricted_${toItem(row).country_id}`"
					@update:model-value="(value) => emit('update:isRestricted', toItem(row).country_id, value)"
				/>
			</div>
		</template>
	</DataTable>
</template>
