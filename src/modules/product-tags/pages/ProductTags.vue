<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import Pagination from '@/shared/ui/Pagination.vue'
	import TextField from '@/shared/ui/TextField.vue'
	const ProductTagCreateModal = defineAsyncComponent(() => import('../components/ProductTagCreateModal.vue'))
	import ProductTagsTable from '../components/ProductTagsTable.vue'

	import { BrandsIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { ProductTag } from '../types'

	const loading = ref(false)
	const tags = ref<ProductTag[]>([])
	const showTagModal = ref(false)
	const selectedTag = ref<ProductTag | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)
	const total = ref(0)
	const limit = ref(10)
	const offset = ref(0)
	const filters = ref({
		search: ''
	})

	const load = async () => {
		loading.value = true
		try {
			const result = await api.listProductTags({
				name: filters.value.search,
				limit: limit.value,
				offset: offset.value
			})
			tags.value = result.items
			total.value = result.total
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const openCreate = () => {
		selectedTag.value = null
		showTagModal.value = true
	}

	const closeTagModal = () => {
		showTagModal.value = false
		selectedTag.value = null
	}

	const editTag = (tag: ProductTag) => {
		selectedTag.value = tag
		showTagModal.value = true
	}

	const deleteTag = (tag: ProductTag) => {
		selectedTag.value = tag
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedTag.value?.id) return

		loadingDeleteModal.value = true
		try {
			await api.deleteProductTag(selectedTag.value.id)
			showDeleteModal.value = false
			selectedTag.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const applyFilters = async () => {
		offset.value = 0
		await load()
	}

	const resetFilters = async () => {
		filters.value = {
			search: ''
		}
		limit.value = 10
		offset.value = 0
		await load()
	}

	const changeOffset = async (value: number) => {
		offset.value = value
		await load()
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Теги товаров" subtitle="Список тегов и управление ими." :icon="BrandsIcon" :total="total">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить тег</Button>
			</template>
		</Banner>

		<form
			class="grid grid-cols-1 gap-4 rounded-2xl border border-gray-200 bg-white p-4 md:grid-cols-4"
			@submit.prevent="applyFilters"
		>
			<TextField v-model.trim="filters.search" label="Поиск" name="search" placeholder="Поиск" />

			<div class="flex items-end gap-2">
				<Button type="submit" size="sm">Фильтр</Button>
				<Button type="button" variant="outline" size="sm" :on-click="resetFilters">Сброс</Button>
			</div>
		</form>

		<ProductTagsTable
			:tags="tags"
			:loading="loading"
			:pagination="{ limit, offset }"
			@edit="editTag"
			@delete="deleteTag"
		/>

		<Pagination :total="total" :limit="limit" :offset="offset" @update:offset="changeOffset" />

		<ProductTagCreateModal
			v-if="showTagModal"
			:open="showTagModal"
			:tag="selectedTag"
			@close="closeTagModal"
			@saved="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedTag?.name"
			entity-name="тег"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
