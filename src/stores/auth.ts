import { apiBase } from '@/shared'
import { normalizeUserPermissions, normalizeUserRoles } from '@/shared/auth/user-access'
import type { IAuthUser, IFormLogin } from '@/shared/types'
import { defineStore } from 'pinia'
import { computed, type ComputedRef, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCookies } from 'vue3-cookies'

interface IAuthStore {
	isAuth: ComputedRef<boolean>
	user: Ref<IAuthUser>
	permissions: Ref<string[]>
	roles: Ref<string[]>
	profileLoaded: Ref<boolean>
	getProfile: () => Promise<void>
	login: (form: IFormLogin) => Promise<boolean>
	logout: () => void
}

const applyAuthPayload = (
	payload: Record<string, unknown> | null | undefined,
	target: {
		user: Ref<IAuthUser>
		permissions: Ref<string[]>
		roles: Ref<string[]>
	}
) => {
	const data = (payload?.user as Record<string, unknown> | undefined) ?? payload
	if (!data) return

	target.user.value = {
		id: (data.id as number | null | undefined) ?? null,
		name: String(data.name ?? ''),
		email: data.email != null ? String(data.email) : ''
	}
	target.permissions.value = normalizeUserPermissions(data)
	target.roles.value = normalizeUserRoles(data)
}

export const useAuth = defineStore('auth', (): IAuthStore => {
	const { cookies } = useCookies()
	const router = useRouter()
	const ADMIN_PREFIX = '/admin-panel'

	const user = ref<IAuthUser>({
		id: null,
		name: '',
		email: ''
	})
	const permissions = ref<string[]>([])
	const roles = ref<string[]>([])
	const profileLoaded = ref(false)

	const isAuth = computed((): boolean => !!user.value.id)

	async function getProfile(): Promise<void> {
		try {
			const response = await apiBase.getProfile()
			const payload = (response?.data ?? response) as Record<string, unknown>
			applyAuthPayload(payload, { user, permissions, roles })
			profileLoaded.value = true
		} catch (error) {
			console.error(error)
		}
	}

	async function login(form: IFormLogin): Promise<boolean> {
		try {
			const response = await apiBase.login(form)
			const data = response?.data ?? response

			cookies.set('plus_canvas_admin_authorization', data.access_token, 60000000)

			applyAuthPayload(data as Record<string, unknown>, { user, permissions, roles })
			profileLoaded.value = true
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
		permissions.value = []
		roles.value = []
		profileLoaded.value = false
		cookies.remove('plus_canvas_admin_authorization')
		router.push(`${ADMIN_PREFIX}/login`)
	}

	return {
		isAuth,
		user,
		permissions,
		roles,
		profileLoaded,
		getProfile,
		login,
		logout
	}
})
