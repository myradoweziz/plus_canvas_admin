<script setup lang="ts">
	import { defineAsyncComponent, onMounted, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import BannersTable from '../components/BannersTable.vue'
	const BannerCreateModal = defineAsyncComponent(() => import('../components/BannerCreateModal.vue'))

	import { BannerIcon } from '@/shared/icons'
	import { api } from '../api'
	import type { Banner as BannerT } from '../types'

	const loading = ref(false)
	const banners = ref<BannerT[]>([])
	const showBannerModal = ref(false)
	const selectedBanner = ref<BannerT | null>(null)
	const showDeleteModal = ref(false)
	const loadingDeleteModal = ref(false)

	const load = async () => {
		loading.value = true
		try {
			banners.value = await api.listBanners()
		} finally {
			loading.value = false
		}
	}

	onMounted(load)

	const editBanner = (banner: BannerT) => {
		selectedBanner.value = banner
		showBannerModal.value = true
	}

	const openCreate = () => {
		selectedBanner.value = null
		showBannerModal.value = true
	}
	const closeBannerModal = () => {
		showBannerModal.value = false
		selectedBanner.value = null
	}

	const deleteBanner = (banner: BannerT) => {
		selectedBanner.value = banner
		showDeleteModal.value = true
	}

	const confirmDelete = async () => {
		if (!selectedBanner.value) return
		loadingDeleteModal.value = true
		try {
			await api.deleteBanner(selectedBanner.value?.id ?? 0)
			showDeleteModal.value = false
			selectedBanner.value = null
			await load()
		} finally {
			loadingDeleteModal.value = false
		}
	}

	const reorderBanners = async (orderedBanners: BannerT[]) => {
		toast.info('Порядок изменён. Сохраняю...')
		try {
			banners.value = orderedBanners
			await api.reorderBanners({
				orders: orderedBanners
					.filter((banner): banner is BannerT & { id: number } => banner.id !== null)
					.map((banner) => ({
						id: banner.id,
						order: banner.order
					}))
			})
			await load()
			toast.success('Порядок сохранён')
		} catch (e) {
			toast.error('Не удалось сохранить порядок')
			await load()
		}
	}
</script>

<template>
	<div class="space-y-6">
		<Banner title="Баннеры" subtitle="Список баннеров и управление ими." :icon="BannerIcon" :total="banners?.length">
			<template #actions>
				<Button type="button" size="sm" :on-click="openCreate">Добавить баннер</Button>
			</template>
		</Banner>

		<BannersTable
			:banners="banners"
			:loading="loading"
			@add="openCreate"
			@edit="editBanner"
			@delete="deleteBanner"
			@reorder="reorderBanners"
		/>

		<BannerCreateModal
			v-if="showBannerModal"
			:open="showBannerModal"
			:banner="selectedBanner"
			@close="closeBannerModal"
			@created="load"
		/>

		<DeleteModal
			:open="showDeleteModal"
			:title="selectedBanner?.title"
			entity-name="баннер"
			:loading="loadingDeleteModal"
			@close="showDeleteModal = false"
			@confirm="confirmDelete"
		/>
	</div>
</template>
