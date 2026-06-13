<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import CustomerReportTable from '../components/CustomerReportTable.vue'

	import { toast } from 'vue3-toastify'

	import {
		DELIVERY_STATUS_FILTER_OPTIONS,
		ORDER_STATUS_FILTER_OPTIONS,
		PAYMENT_STATUS_FILTER_OPTIONS
	} from '@/modules/orders/helpers'
	import { UserActivityIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { CustomerReportItem } from '../types'

	const loading = ref(false)
	const exporting = ref(false)
	const rows = ref<CustomerReportItem[]>([])
	const totalCount = ref(0)
	const limit = ref(15)
	const offset = ref(0)

	const filters = ref({
		date_from: '',
		date_to: '',
		order_status: null as string | null,
		payment_status: null as string | null,
		delivery_status: null as string | null
	})

	const load = async () => {
		loading.value = true
		try {
			const { data, total } = await api.getCustomerReport({
				date_from: filters.value.date_from || undefined,
				date_to: filters.value.date_to || undefined,
				order_status: filters.value.order_status ?? undefined,
				payment_status: filters.value.payment_status ?? undefined,
				delivery_status: filters.value.delivery_status ?? undefined,
				limit: limit.value,
				offset: offset.value
			})
			rows.value = data
			totalCount.value = total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			date_from: '',
			date_to: '',
			order_status: null,
			payment_status: null,
			delivery_status: null
		}
		limit.value = 15
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const exportExcel = async () => {
		exporting.value = true
		try {
			await api.exportCustomerReportExcel({
				date_from: filters.value.date_from || undefined,
				date_to: filters.value.date_to || undefined,
				order_status: filters.value.order_status ?? undefined,
				payment_status: filters.value.payment_status ?? undefined,
				delivery_status: filters.value.delivery_status ?? undefined
			})
			toast.success('Excel файл скачан')
		} catch (error) {
			console.error(error)
			toast.error('Ошибка при экспорте в Excel')
		} finally {
			exporting.value = false
		}
	}

	const exportXml = async () => {
		exporting.value = true
		try {
			await api.exportCustomerReportXml({
				date_from: filters.value.date_from || undefined,
				date_to: filters.value.date_to || undefined,
				order_status: filters.value.order_status ?? undefined,
				payment_status: filters.value.payment_status ?? undefined,
				delivery_status: filters.value.delivery_status ?? undefined
			})
			toast.success('XML файл скачан')
		} catch (error) {
			console.error(error)
			toast.error('Ошибка при экспорте в XML')
		} finally {
			exporting.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Отчёт по пользователям"
			subtitle="Статистика заказов по пользователям."
			:icon="UserActivityIcon"
			:total="totalCount"
		>
			<template #actions>
				<div class="flex flex-wrap items-center gap-2">
					<Button
						type="button"
						size="sm"
						variant="outline"
						:disabled="exporting || totalCount === 0"
						:loading="exporting"
						:on-click="exportExcel"
					>
						Экспорт Excel
					</Button>
					<Button
						type="button"
						size="sm"
						variant="outline"
						:disabled="exporting || totalCount === 0"
						:loading="exporting"
						:on-click="exportXml"
					>
						Экспорт XML
					</Button>
				</div>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-3 xl:grid-cols-5"
			@submit.prevent="applyFilters"
		>
			<TextField v-model="filters.date_from" label="Дата с" name="date_from" type="date" />
			<TextField v-model="filters.date_to" label="Дата по" name="date_to" type="date" />
			<SelectField
				v-model="filters.order_status"
				label="Статус заказа"
				name="order_status"
				placeholder="Все"
				:options="ORDER_STATUS_FILTER_OPTIONS"
			/>
			<SelectField
				v-model="filters.payment_status"
				label="Статус оплаты"
				name="payment_status"
				placeholder="Все"
				:options="PAYMENT_STATUS_FILTER_OPTIONS"
			/>
			<SelectField
				v-model="filters.delivery_status"
				label="Статус доставки"
				name="delivery_status"
				placeholder="Все"
				:options="DELIVERY_STATUS_FILTER_OPTIONS"
			/>

			<div class="flex items-end gap-2 md:col-span-3 xl:col-span-5">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<CustomerReportTable :rows="rows" :loading="loading" :pagination="{ limit, offset }" />

		<Pagination :total="totalCount" :limit="limit" :offset="offset" @update:offset="changeOffset" />
	</div>
</template>
