<script setup lang="ts">
	import { computed, onMounted, ref, watch } from 'vue'
	import { useRoute, useRouter } from 'vue-router'

	import Button from '@/shared/ui/Button.vue'
	import UserAddressesTab from '../components/user/UserAddressesTab.vue'
	import UserForm from '../components/user/UserForm.vue'
	import UserFormTabBar from '../components/user/UserFormTabBar.vue'
	import UserOrdersTab from '../components/user/UserOrdersTab.vue'
	import UserSendEmailForm from '../components/user/UserSendEmailForm.vue'
	// import UserSendMessageForm from '../components/user/UserSendMessageForm.vue'
	import UserActivityLogsTab from '../components/user/UserActivityLogsTab.vue'
	import UserShoppingCartTab from '../components/user/UserShoppingCartTab.vue'
	import UserWishlistTab from '../components/user/UserWishlistTab.vue'

	import { api } from '../api'
	import { getUserFormTabs, type UserFormTab } from '../helpers/user-form'
	import type { User } from '../types'

	const route = useRoute()
	const router = useRouter()
	const loading = ref(false)
	const user = ref<User | null>(null)
	const activeTab = ref<UserFormTab>('main')
	const isCreate = computed(() => route.path.endsWith('/create'))
	const userId = computed(() => {
		const id = Number(route.params.id)
		return Number.isFinite(id) ? id : null
	})

	const pageTitle = computed(() =>
		isCreate.value ? 'Добавить пользователя' : user.value?.name || `Пользователь #${userId.value ?? ''}`
	)

	const tabs = computed(() => getUserFormTabs(!isCreate.value && !!userId.value, user.value?.roles))

	const loadUser = async () => {
		if (isCreate.value || !userId.value) {
			user.value = null
			activeTab.value = 'main'
			return
		}

		loading.value = true
		try {
			user.value = await api.getUser(userId.value)
		} finally {
			loading.value = false
		}
	}

	const goBack = () => {
		router.push('/admin-panel/settings/users')
	}

	const onSaved = () => {
		goBack()
	}

	onMounted(loadUser)

	watch(userId, () => {
		activeTab.value = 'main'
		loadUser()
	})

	watch(tabs, (currentTabs) => {
		if (!currentTabs.some((tab) => tab.id === activeTab.value)) {
			activeTab.value = 'main'
		}
	})
</script>

<template>
	<div class="space-y-6">
		<div class="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
			<div class="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 class="text-lg font-semibold text-gray-900">{{ pageTitle }}</h3>
					<p class="mt-1 text-sm text-gray-600">
						{{ isCreate ? 'Заполните поля и сохраните.' : 'Редактирование пользователя.' }}
					</p>
				</div>
				<Button type="button" variant="outline" size="sm" :on-click="goBack">Назад к списку</Button>
			</div>

			<UserFormTabBar v-if="tabs.length > 1" v-model:active-tab="activeTab" :tabs="tabs" />

			<p v-if="loading" class="mt-6 text-sm text-gray-600">Загрузка...</p>
			<p v-else-if="!isCreate && !user" class="mt-6 text-sm text-gray-600">Пользователь не найден.</p>

			<div v-else class="mt-6">
				<UserForm v-if="activeTab === 'main'" :user="isCreate ? null : user" @saved="onSaved" @cancel="goBack" />
				<UserOrdersTab v-else-if="activeTab === 'orders' && userId" :user-id="userId" />
				<UserAddressesTab v-else-if="activeTab === 'addresses' && userId" :user-id="userId" :user="user" />
				<UserShoppingCartTab v-else-if="activeTab === 'shoppingCart' && userId" :user-id="userId" />
				<UserWishlistTab v-else-if="activeTab === 'wishlist' && userId" :user-id="userId" />
				<UserActivityLogsTab v-else-if="activeTab === 'activityLogs' && userId" :user-id="userId" />
				<UserSendEmailForm
					v-else-if="activeTab === 'sendEmail' && userId"
					:user-id="userId"
					:user-email="user?.email"
				/>
				<!-- <UserSendMessageForm
					v-else-if="activeTab === 'sendMessage' && userId"
					:user-id="userId"
					:user-email="user?.email"
				/> -->
			</div>
		</div>
	</div>
</template>
