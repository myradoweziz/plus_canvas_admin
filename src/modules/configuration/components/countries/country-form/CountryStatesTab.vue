<script setup lang="ts">
	import { computed, defineAsyncComponent, onMounted, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import CountryStatesTable from '../CountryStatesTable.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../../../api'
	import type { CountryState } from '../../../types'

	const CountryStateModal = defineAsyncComponent(() => import('../CountryStateModal.vue'))

	const props = defineProps<{ countryId: number }>()

	const loading = ref(false)
	const loadingDeleteModal = ref(false)
	const items = ref<CountryState[]>([])
	const showModal = ref(false)
	const showDeleteModal = ref(false)
	const selectedItem = ref<CountryState | null>(null)
	const selectedEditItem = ref<CountryState | null>(null)

	const modalState = computed(() => selectedEditItem.value)

	const load = async () => {
		loading.value = true
		try {
			items.value = await api.listCountryStates(props.countryId)
		} catch (err) {
			items.value = []
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else toast.error('Не удалось загрузить регионы')
		} finally {
			loading.value = false
		}
	}

	const openCreate = () => {
		selectedEditItem.value = null
		showModal.value = true
	}

	const editItem = (item: CountryState) => {
		selectedEditItem.value = item
		showModal.value = true
	}

	const closeModal = () => {
		showModal.value = false
		selectedEditItem.value = null
	}

	const deleteItem = (item: CountryState) => {
		selectedItem.value = item
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedItem.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteCountryState(props.countryId, selectedItem.value.id)
			toast.success('Регион удалён')
			showDeleteModal.value = false
			selectedItem.value = null
			await load()
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			loadingDeleteModal.value = false
		}
	}

	onMounted(load)

	watch(
		() => props.countryId,
		() => load()
	)
</script>

<template>
	<div class="space-y-4">
		<div class="flex items-center justify-end">
			<Button type="button" size="sm" :on-click="openCreate">Добавить регион</Button>
		</div>

		<CountryStatesTable :items="items" :loading="loading" @edit="editItem" @delete="deleteItem" />

		<CountryStateModal
			v-if="showModal"
			:open="showModal"
			:country-id="countryId"
			:state="modalState"
			@close="closeModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedItem?.name"
			entity-name="регион"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
