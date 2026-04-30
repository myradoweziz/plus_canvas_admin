<script setup lang="ts">
	import { toTypedSchema } from '@vee-validate/zod'
	import { useForm } from 'vee-validate'
	import { computed, ref } from 'vue'
	import { useRouter } from 'vue-router'
	import { useCookies } from 'vue3-cookies'
	import { toast } from 'vue3-toastify'
	import { z } from 'zod'

	import CommonGridShape from '@/components/common/CommonGridShape.vue'
	import FullScreenLayout from '@/components/layout/FullScreenLayout.vue'
	import CloseEye from '@/shared/icons/CloseEye.vue'
	import Eye from '@/shared/icons/Eye.vue'
	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { apiBase } from '@/shared/api/base'
	import type { IFormLogin } from '@/shared/types'

	const { errors, defineField, handleSubmit } = useForm({
		initialValues: {
			email: 'admin@pluscanvas.com',
			password: 'admin123'
		},
		validationSchema: toTypedSchema(
			z.object({
				email: z.string().min(1, 'E-posta adresi gereklidir.').email('Geçersiz e-posta adresi'),
				password: z.string().min(6, 'Şifre en az 6 karakter uzunluğunda olmalıdır')
			})
		)
	})

	const [email, emailProps] = defineField('email')
	const [password, passwordProps] = defineField('password')

	const showPassword = ref(false)

	const togglePasswordVisibility = () => {
		showPassword.value = !showPassword.value
	}

	const isDisabled = computed(() => {
		return Object.values(errors.value).some((error) => error)
	})

	const isLoading = ref(false)

	const router = useRouter()
	const { cookies } = useCookies()
	const onSubmit = handleSubmit(async (values: IFormLogin) => {
		isLoading.value = true
		try {
			const { token } = await apiBase.login({
				email: values.email,
				password: values.password
			})

			cookies.set('plus_canvas_admin_authorization', token)
			toast.success('Giriş başarılı')
			router.push('/')
		} catch (error) {
			console.error(error)
			toast.error('Giriş başarısız')
		} finally {
			isLoading.value = false
		}
	})
</script>

<template>
	<FullScreenLayout>
		<div class="relative min-h-screen flex bg-slate-50 overflow-hidden">
			<!-- Left Side: Form Section -->
			<div
				class="flex-1 flex flex-col justify-center px-8 sm:px-12 md:px-24 lg:px-32 xl:px-48 z-10 bg-white shadow-2xl"
			>
				<div class="max-w-md w-full mx-auto">
					<!-- Header Section -->
					<div class="mb-10">
						<h1 class="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Hoş Geldiniz</h1>
						<p class="text-slate-500 text-lg font-medium">Lütfen bilgilerinizi girerek giriş yapın.</p>
					</div>

					<!-- Form Section -->
					<form @submit.prevent="onSubmit" class="space-y-6">
						<div class="space-y-5">
							<TextField
								label="E-posta"
								type="email"
								name="email"
								v-model="email"
								v-bind="emailProps"
								placeholder="admin@pluscanvas.com"
								:error-message="errors.email"
								class="transition-all duration-200"
							/>
							<TextField
								@toggle-prepend-icon="togglePasswordVisibility"
								label="Şifre"
								:type="!showPassword ? 'password' : 'text'"
								name="password"
								v-bind="passwordProps"
								v-model="password"
								placeholder="••••••••"
								:error-message="errors.password"
								class="transition-all duration-200"
								:prepend-icon="!showPassword ? Eye : CloseEye"
							/>
						</div>

						<Button
							className="w-full py-4 text-base font-semibold tracking-wide transform active:scale-[0.98] transition-all duration-200"
							:disabled="isDisabled"
							:loading="isLoading"
						>
							Giriş Yap
						</Button>
					</form>

					<!-- Footer Info -->
					<p class="mt-10 text-center text-sm text-slate-400">
						&copy; 2026 PlusCanvas Admin Panel. Tüm hakları saklıdır.
					</p>
				</div>
			</div>

			<!-- Right Side: Branding Section -->
			<div
				class="hidden lg:flex lg:w-[45%] xl:w-[55%] relative items-center justify-center bg-blue-600 overflow-hidden"
			>
				<!-- Decorative Background Elements -->
				<div class="absolute inset-0 bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500"></div>
				<div class="absolute inset-0 opacity-20">
					<common-grid-shape />
				</div>

				<!-- Animated Circles (Subtle) -->
				<div
					class="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/10 rounded-full blur-3xl animate-pulse"
				></div>
				<div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-400/20 rounded-full blur-3xl"></div>

				<!-- Logo and Content -->
				<div class="relative z-20 flex flex-col items-center text-center px-12">
					<div
						class="p-8 bg-white/10 backdrop-blur-md rounded-3xl border border-white/20 shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500"
					>
						<img src="@/assets/images/plus_logo.svg" alt="PlusCanvas Logo" class="w-48 h-auto" />
					</div>
					<h2 class="text-white text-2xl font-bold mb-4">Dijital Sanatın Yeni Merkezi</h2>
					<p class="text-blue-100 text-lg max-w-sm font-medium leading-relaxed">
						Yönetim panelinize erişerek tüm süreçleri kolayca kontrol edin.
					</p>
				</div>

				<!-- Floating Shape (Optional) -->
				<div class="absolute bottom-10 right-10 flex space-x-2 opacity-50">
					<div class="w-3 h-3 bg-white rounded-full"></div>
					<div class="w-3 h-3 bg-white/50 rounded-full"></div>
					<div class="w-3 h-3 bg-white/20 rounded-full"></div>
				</div>
			</div>
		</div>
	</FullScreenLayout>
</template>
