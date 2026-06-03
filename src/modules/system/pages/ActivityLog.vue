<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import ActivityLogTable from '../components/activity-log/ActivityLogTable.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { ActivityLogIcon } from '@/shared/icons'
	import { api } from '../api'
	import { ACTIVITY_LOG_EVENT_FILTER_OPTIONS } from '../helpers'
	import type { ActivityLog } from '../types'

	const loading = ref(false)
	const clearing = ref(false)
	const showClearModal = ref(false)
	const items = ref<ActivityLog[]>([])
	const total = ref(0)
	const limit = ref(20)
	const offset = ref(0)

	const filters = ref({
		date: '',
		event: '',
		email: ''
	})

	const currentPage = computed(() => Math.floor(offset.value / limit.value) + 1)

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listActivityLog({
				page: currentPage.value,
				per_page: limit.value,
				date: filters.value.date || undefined,
				event: filters.value.event || undefined,
				email: filters.value.email || undefined
			})
			items.value = result.items
			total.value = result.total
		} catch (err) {
			items.value = []
			total.value = 0
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else toast.error('Не удалось загрузить лог активности')
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
		filters.value = { date: '', event: '', email: '' }
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}

	const confirmClear = async () => {
		clearing.value = true
		try {
			await api.clearActivityLog()
			toast.success('Лог активности очищен')
			showClearModal.value = false
			offset.value = 0
			await load()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else toast.error('Не удалось очистить лог')
		} finally {
			clearing.value = false
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner
			title="Лог активности"
			subtitle="История действий в админ-панели. Фильтры: дата, событие, email."
			:icon="ActivityLogIcon"
			:total="total"
		>
			<template #actions>
				<Button
					type="button"
					size="sm"
					variant="outline"
					class-name="text-red-700 ring-red-200 hover:bg-red-50"
					:disabled="loading || clearing || !total"
					:on-click="() => (showClearModal = true)"
				>
					Очистить лог
				</Button>
			</template>
		</Banner>

		<section class="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
			<div class="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
				<TextField v-model="filters.date" label="Дата" name="date" type="date" />
				<SelectField
					v-model="filters.event"
					label="Событие"
					name="event"
					:options="ACTIVITY_LOG_EVENT_FILTER_OPTIONS"
					placeholder="Все события"
				/>
				<TextField v-model="filters.email" label="Email" name="email" placeholder="admin@example.com" />
			</div>
			<div class="mt-4 flex flex-wrap gap-2">
				<Button type="button" size="sm" :disabled="loading" :on-click="applyFilters"> Фильтр </Button>
				<Button type="button" size="sm" variant="outline" :disabled="loading" :on-click="resetFilters">
					Сбросить
				</Button>
			</div>
		</section>

		<ActivityLogTable :items="items" :loading="loading" />

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<DeleteModal
			:open="showClearModal"
			entity-name="лог активности"
			cancel-text="Отмена"
			confirm-text="Очистить"
			loading-text="Очистка..."
			:loading="clearing"
			@close="showClearModal = false"
			@confirm="confirmClear"
		/>
	</div>
</template>
