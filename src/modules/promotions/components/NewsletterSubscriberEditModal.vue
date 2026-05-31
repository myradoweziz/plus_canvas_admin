<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import type { NewsletterSubscriber } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; subscriber: NewsletterSubscriber | null }>()

	const saving = ref(false)

	const form = reactive({
		email: '',
		is_active: true
	})

	const fieldErrors = reactive({
		email: ''
	})

	const resetLocalForm = () => {
		form.email = ''
		form.is_active = true
		fieldErrors.email = ''
	}

	const validate = () => {
		fieldErrors.email = ''

		if (!form.email.trim()) {
			fieldErrors.email = 'Укажите email'
			return false
		}

		return true
	}

	watch(
		() => [props.open, props.subscriber] as const,
		([open, subscriber]) => {
			if (!open) return
			if (!subscriber) {
				resetLocalForm()
				return
			}

			form.email = subscriber.email ?? ''
			form.is_active = !!subscriber.is_active
			fieldErrors.email = ''
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!props.subscriber?.id || !validate()) return

		saving.value = true
		try {
			await api.updateNewsletterSubscriber(props.subscriber.id, {
				email: form.email.trim(),
				is_active: form.is_active
			})

			toast.success('Подписчик успешно обновлён')
			emit('saved')
			emit('close')
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else throw err
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-lg rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">Редактировать подписчика</h3>
					<p class="mt-1 text-sm text-gray-600">Измените email или статус активности.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 space-y-4" @submit.prevent="onSubmit">
				<TextField
					v-model.trim="form.email"
					label="Email"
					required
					name="email"
					type="email"
					placeholder="email@example.com"
					:error-message="fieldErrors.email"
				/>

				<CheckboxField v-model="form.is_active" label="Активен" name="is_active" />

				<div class="mt-2 flex items-center justify-end gap-3">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
