<script setup lang="ts">
	import { useRouter } from 'vue-router'

	import EditIcon from '@/shared/icons/EditIcon.vue'
	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'

	import { BESTSELLERS_TABLE_COLUMNS } from '../helpers'
	import type { Bestseller } from '../types'

	const props = defineProps<{
		bestsellers: Bestseller[]
		loading: boolean
		pagination: { limit: number; offset: number }
	}>()

	const toBestseller = (row: unknown) => row as Bestseller

	const router = useRouter()

	const showProduct = (id: number) => {
		router.push(`/admin-panel/products/${id}/edit`)
	}
</script>

<template>
	<DataTable
		:columns="BESTSELLERS_TABLE_COLUMNS"
		:rows="bestsellers"
		:loading="loading"
		empty-text="Данные не найдены."
		:pagination="pagination"
	>
		<template #cell-canvas_product_name="{ row }">
			<span class="font-medium text-gray-800">{{ toBestseller(row).canvas_product_name }}</span>
		</template>

		<template #cell-sales_count="{ row }">
			<span class="font-medium text-gray-800">{{ toBestseller(row).sales_count }}</span>
		</template>

		<template #cell-total_amount_without_tax="{ row }">
			<span class="font-medium text-gray-800">{{ toBestseller(row).total_amount_without_tax }}</span>
		</template>

		<template #cell-actions="{ row }">
			<div class="flex justify-end">
				<Button
					size="icon"
					variant="ghost"
					aria-label="Edit"
					:on-click="() => showProduct(toBestseller(row).canvas_product_id)"
					class-name="hover:bg-green-100"
				>
					<EditIcon />
				</Button>
			</div>
		</template>
	</DataTable>
</template>
