import { apiBase } from '@/shared'
import type { IAuthUser, IFormLogin } from '@/shared/types'
import { defineStore } from 'pinia'
import { computed, type ComputedRef, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookies } from 'vue3-cookies'

interface IAuthStore {
	isAuth: ComputedRef<boolean>
	user: Ref<IAuthUser>
	getProfile: () => Promise<void>
	login: (form: any) => Promise<boolean>
	logout: () => void
}

export const useAuth = defineStore('auth', (): IAuthStore => {
	const { cookies } = useCookies()
	const router = useRouter()

	const user = ref<IAuthUser>({
		id: null,
		name: '',
		email: ''
	})

	const isAuth = computed((): boolean => !!user.value.id)

	async function getProfile(): Promise<void> {
		try {
			const { data } = await apiBase.getProfile()

			user.value = {
				id: data.id || null,
				name: data.name,
				email: data.email
			}
		} catch (error) {
			console.error(error)
		}
	}

	async function login(form: IFormLogin): Promise<boolean> {
		try {
			const { data } = await apiBase.login(form)

			cookies.set('plus_canvas_admin_authorization', data.access_token, 60000000)

			user.value = {
				email: data?.user?.email,
				name: data?.user?.name,
				id: data?.user?.id
			}
			return true
		} catch (error) {
			console.error(error)
			return false
		}
	}

	function logout() {
		user.value = {
			name: '',
			email: '',
			id: null
		}
		cookies.remove('plus_canvas_admin_authorization')
		router.push('/login')
	}

	return {
		isAuth,
		user,
		getProfile,
		login,
		logout
	}
})
