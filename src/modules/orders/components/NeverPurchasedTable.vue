<script setup lang="ts">
	import { useRouter } from 'vue-router'

	import DataTable from '@/shared/ui/DataTable.vue'

	import { NEVER_PURCHASED_TABLE_COLUMNS } from '../helpers'
	import type { NeverPurchasedProduct } from '../types'

	defineProps<{
		products: NeverPurchasedProduct[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const toProduct = (row: unknown) => row as NeverPurchasedProduct

	const router = useRouter()

	const showProduct = (id: number) => {
		router.push(`/admin-panel/products/${id}/edit`)
	}
</script>

<template>
	<DataTable
		:columns="NEVER_PURCHASED_TABLE_COLUMNS"
		:rows="products"
		:loading="loading"
		empty-text="Все товары хотя бы раз были куплены."
		:pagination="pagination"
		clickable
		@row-click="(row) => showProduct(toProduct(row).id)"
	>
		<template #cell-image="{ row }">
			<div class="h-10 w-10 overflow-hidden rounded-lg bg-gray-100">
				<img
					v-if="toProduct(row).images?.[0]?.url"
					:src="toProduct(row).images[0].url"
					:alt="toProduct(row).name"
					class="h-full w-full object-cover"
				/>
			</div>
		</template>

		<template #cell-name="{ row }">
			<span class="font-medium text-gray-800">{{ toProduct(row).name }}</span>
		</template>

	</DataTable>
</template>
