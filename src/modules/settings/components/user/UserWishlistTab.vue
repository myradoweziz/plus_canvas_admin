<script setup lang="ts">
	import { onMounted, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import UserWishlistTable from './UserWishlistTable.vue'

	import { api } from '../../api'
	import type { UserWishlistItem } from '../../types'

	const props = defineProps<{ userId: number }>()

	const loading = ref(false)
	const items = ref<UserWishlistItem[]>([])

	const loadWishlist = async () => {
		loading.value = true
		try {
			items.value = await api.getUserWishlist(props.userId)
		} catch {
			items.value = []
			toast.error('Не удалось загрузить wishlist')
		} finally {
			loading.value = false
		}
	}

	onMounted(loadWishlist)

	watch(
		() => props.userId,
		() => loadWishlist()
	)
</script>

<template>
	<UserWishlistTable :items="items" :loading="loading" />
</template>
