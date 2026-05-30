<script setup lang="ts">
	import { reactive, ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import Button from '@/shared/ui/Button.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../../api'

	const props = defineProps<{ userId: number; userEmail?: string }>()

	const saving = ref(false)
	const triedSubmit = ref(false)

	const form = reactive({
		subject: '',
		message: ''
	})

	const fieldErrors = reactive({
		subject: '',
		message: ''
	})

	const validate = () => {
		fieldErrors.subject = ''
		fieldErrors.message = ''

		let ok = true
		if (!form.subject.trim()) {
			fieldErrors.subject = 'Укажите тему'
			ok = false
		}
		if (!form.message.trim()) {
			fieldErrors.message = 'Укажите сообщение'
			ok = false
		}
		return ok
	}

	const onSubmit = async () => {
		triedSubmit.value = true
		if (!validate()) {
			const first = fieldErrors.subject || fieldErrors.message
			if (first) toast.error(first)
			return
		}

		saving.value = true
		try {
			await api.sendUserMessage(props.userId, {
				subject: form.subject.trim(),
				message: form.message.trim()
			})
			toast.success('Сообщение отправлено')
			form.subject = ''
			form.message = ''
			triedSubmit.value = false
			fieldErrors.subject = ''
			fieldErrors.message = ''
		} catch (err) {
			const msg = getFirstBackendValidationMessage(err)
			if (msg) toast.error(msg)
			else toast.error('Не удалось отправить сообщение')
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<form class="grid grid-cols-1 gap-4 md:max-w-2xl" @submit.prevent="onSubmit">
		<p v-if="userEmail" class="text-sm text-gray-600">
			Получатель: <span class="font-medium text-gray-900">{{ userEmail }}</span>
		</p>

		<TextField
			v-model="form.subject"
			label="Тема"
			required
			name="subject"
			placeholder="Тема сообщения"
			:error-message="triedSubmit ? fieldErrors.subject : ''"
		/>

		<TextareaField
			v-model="form.message"
			label="Сообщение"
			required
			name="message"
			placeholder="Текст сообщения"
			:error-message="triedSubmit ? fieldErrors.message : ''"
		/>

		<div class="flex items-center justify-end gap-3">
			<Button type="submit" size="sm" :disabled="saving" :loading="saving">
				{{ saving ? 'Отправка...' : 'Отправить' }}
			</Button>
		</div>
	</form>
</template>
