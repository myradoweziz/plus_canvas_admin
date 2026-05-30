<script setup lang="ts">
	import { onMounted, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import UserShoppingCartTable from './UserShoppingCartTable.vue'

	import { api } from '../../api'
	import type { UserShoppingCartItem } from '../../types'

	const props = defineProps<{ userId: number }>()

	const loading = ref(false)
	const items = ref<UserShoppingCartItem[]>([])

	const loadShoppingCart = async () => {
		loading.value = true
		try {
			items.value = await api.getUserShoppingCart(props.userId)
		} catch {
			items.value = []
			toast.error('Не удалось загрузить корзину')
		} finally {
			loading.value = false
		}
	}

	onMounted(loadShoppingCart)

	watch(
		() => props.userId,
		() => loadShoppingCart()
	)
</script>

<template>
	<UserShoppingCartTable :items="items" :loading="loading" />
</template>
