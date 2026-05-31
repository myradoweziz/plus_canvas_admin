<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import DataTable from '@/shared/ui/DataTable.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { useFieldErrors } from '@/modules/products/composables'
	import { getErrorMessage, getValidationErrors } from '@/shared/api/errors'
	import { TrashIcon, TurkishLiraIcon } from '@/shared/icons'
	import { api } from '../../api'
	import { formatOrderItemOptions, getOrderItemProduct, ORDER_ITEMS_TABLE_COLUMNS } from '../../helpers'
	import type { OrderItem } from '../../types'

	type ItemDraft = {
		quantity: number
		price: number
		discount_amount: number
		total: number
	}

	const props = defineProps<{
		orderId: number
		items: OrderItem[]
	}>()

	const emit = defineEmits<{
		(e: 'refresh'): void
	}>()

	const savingItemId = ref<number | null>(null)
	const deletingItemId = ref<number | null>(null)
	const showDeleteModal = ref(false)
	const selectedItem = ref<OrderItem | null>(null)
	const drafts = ref<Record<number, ItemDraft>>({})
	const { validationErrors, clearFieldError, setValidationErrors, clearAllValidationErrors } = useFieldErrors()

	const toItem = (row: unknown) => row as OrderItem

	const toNumber = (value: string | number | null | undefined) => {
		const parsed = Number(value)
		return Number.isFinite(parsed) ? parsed : 0
	}

	const syncDrafts = (items: OrderItem[]) => {
		drafts.value = Object.fromEntries(
			items.map((item) => [
				item.id,
				{
					quantity: toNumber(item.quantity),
					price: toNumber(item.price),
					discount_amount: toNumber(item.discount_amount),
					total: toNumber(item.total)
				}
			])
		)
	}

	watch(
		() => props.items,
		(items) => syncDrafts(items),
		{ immediate: true }
	)

	const fieldError = (itemId: number, field: keyof ItemDraft) => validationErrors.value[`items.${itemId}.${field}`]

	const clearItemFieldError = (itemId: number, field: keyof ItemDraft) => {
		clearFieldError(`items.${itemId}.${field}`)
	}

	const saveItem = async (item: OrderItem) => {
		const draft = drafts.value[item.id]
		if (!draft) return

		savingItemId.value = item.id
		clearAllValidationErrors()

		try {
			await api.updateOrderItem(props.orderId, item.id, draft)
			emit('refresh')
			toast.success('Позиция обновлена')
		} catch (error) {
			setValidationErrors(getValidationErrors(error))
			toast.error(getErrorMessage(error, 'Не удалось сохранить позицию'))
		} finally {
			savingItemId.value = null
		}
	}

	const productImage = (item: OrderItem) => getOrderItemProduct(item)?.images?.[0]?.url

	const openDeleteModal = (item: OrderItem) => {
		selectedItem.value = item
		showDeleteModal.value = true
	}

	const closeDeleteModal = () => {
		showDeleteModal.value = false
		selectedItem.value = null
	}

	const confirmDelete = async () => {
		if (!selectedItem.value) return

		deletingItemId.value = selectedItem.value.id

		try {
			await api.deleteOrderItem(props.orderId, selectedItem.value.id)
			emit('refresh')
			toast.success('Позиция удалена')
			closeDeleteModal()
		} catch (error) {
			toast.error(getErrorMessage(error, 'Не удалось удалить позицию'))
		} finally {
			deletingItemId.value = null
		}
	}
</script>

<template>
	<div class="space-y-4">
		<DataTable :columns="ORDER_ITEMS_TABLE_COLUMNS" :rows="items" empty-text="Позиций в заказе нет.">
			<template #cell-product="{ row }">
				<div class="flex min-w-[200px] items-center gap-3">
					<img
						v-if="productImage(toItem(row))"
						:src="productImage(toItem(row))"
						:alt="getOrderItemProduct(toItem(row))?.name"
						class="h-12 w-12 shrink-0 rounded-lg border border-gray-200 object-cover"
					/>
					<div class="min-w-0">
						<p class="font-medium text-gray-900">{{ getOrderItemProduct(toItem(row))?.name || '—' }}</p>
						<p class="text-xs text-gray-500">ID: {{ toItem(row).canvas_product_id }}</p>
					</div>
				</div>
			</template>

			<template #cell-options="{ row }">
				<span class="text-sm text-gray-700">{{ formatOrderItemOptions(toItem(row).options) }}</span>
			</template>

			<template #cell-quantity="{ row }">
				<TextField
					v-model.number="drafts[toItem(row).id].quantity"
					:name="`quantity-${toItem(row).id}`"
					label=""
					type="number"
					min="0"
					step="1"
					:error-message="fieldError(toItem(row).id, 'quantity')"
					@update:model-value="clearItemFieldError(toItem(row).id, 'quantity')"
				/>
			</template>

			<template #cell-price="{ row }">
				<TextField
					v-model.number="drafts[toItem(row).id].price"
					:name="`price-${toItem(row).id}`"
					label=""
					type="number"
					min="0"
					step="0.01"
					:append-icon="TurkishLiraIcon"
					:error-message="fieldError(toItem(row).id, 'price')"
					@update:model-value="clearItemFieldError(toItem(row).id, 'price')"
				/>
			</template>

			<template #cell-discount_amount="{ row }">
				<TextField
					v-model.number="drafts[toItem(row).id].discount_amount"
					:name="`discount_amount-${toItem(row).id}`"
					label=""
					type="number"
					min="0"
					step="0.01"
					:append-icon="TurkishLiraIcon"
					:error-message="fieldError(toItem(row).id, 'discount_amount')"
					@update:model-value="clearItemFieldError(toItem(row).id, 'discount_amount')"
				/>
			</template>

			<template #cell-total="{ row }">
				<TextField
					v-model.number="drafts[toItem(row).id].total"
					:name="`total-${toItem(row).id}`"
					label=""
					type="number"
					min="0"
					:append-icon="TurkishLiraIcon"
					step="0.01"
					:error-message="fieldError(toItem(row).id, 'total')"
					@update:model-value="clearItemFieldError(toItem(row).id, 'total')"
				/>
			</template>

			<template #cell-actions="{ row }">
				<div class="flex justify-end gap-2">
					<Button
						type="button"
						size="sm"
						:disabled="savingItemId === toItem(row).id || deletingItemId === toItem(row).id"
						:on-click="() => saveItem(toItem(row))"
					>
						{{ savingItemId === toItem(row).id ? 'Сохранение...' : 'Сохранить' }}
					</Button>
					<Button
						type="button"
						variant="ghost"
						size="icon"
						class-name="hover:text-red-700"
						aria-label="Удалить"
						:disabled="savingItemId === toItem(row).id || deletingItemId === toItem(row).id"
						:on-click="() => openDeleteModal(toItem(row))"
					>
						<TrashIcon />
					</Button>
				</div>
			</template>
		</DataTable>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedItem ? getOrderItemProduct(selectedItem)?.name : undefined"
			entity-name="позицию"
			:loading="deletingItemId !== null"
			@close="closeDeleteModal"
			@confirm="confirmDelete"
		/>
	</div>
</template>
