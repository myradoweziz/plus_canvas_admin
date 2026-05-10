<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { faqsApi } from '../api/faqs'
	import type { Faq } from '../types/faq'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; faq: Faq | null }>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		question: '',
		answer: '',
		order: 0,
		is_active: true
	})

	const fieldErrors = reactive({
		question: '',
		answer: '',
		order: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, { id: null, question: '', answer: '', order: 0, is_active: true })
		fieldErrors.question = ''
		fieldErrors.answer = ''
		fieldErrors.order = ''
	}

	const validate = () => {
		fieldErrors.question = ''
		fieldErrors.answer = ''
		fieldErrors.order = ''

		let ok = true
		if (!form.question.trim()) {
			fieldErrors.question = 'Укажите вопрос'
			ok = false
		}
		if (!form.answer.trim()) {
			fieldErrors.answer = 'Укажите ответ'
			ok = false
		}
		const order = Number(form.order)
		if (!Number.isFinite(order) || order < 0) {
			fieldErrors.order = 'Укажите корректный порядок'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.faq] as const,
		([open, faq]) => {
			if (!open) return
			if (!faq) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: faq.id ?? null,
				question: faq.question ?? '',
				answer: faq.answer ?? '',
				order: faq.order ?? 0,
				is_active: !!faq.is_active
			})
			fieldErrors.question = ''
			fieldErrors.answer = ''
			fieldErrors.order = ''
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: Faq = {
				id: form.id ?? null,
				question: form.question.trim(),
				answer: form.answer.trim(),
				order: Number(form.order) || 0,
				is_active: !!form.is_active
			}

			if (payload.id) {
				await faqsApi.updateFaq(payload)
			} else {
				await faqsApi.createFaq(payload)
			}

			emit('saved')
			emit('close')

			if (!props.faq) resetLocalForm()
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
		<div class="relative z-100000 mx-auto w-[92vw] max-w-3xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ faq ? 'Редактировать FAQ' : 'Добавить FAQ' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-2">
					<TextField
						v-model="form.question"
						label="Вопрос *"
						name="question"
						placeholder="Вопрос"
						:error-message="fieldErrors.question"
					/>
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model="form.answer"
						label="Ответ *"
						name="answer"
						placeholder="Ответ"
						:error-message="fieldErrors.answer"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.order"
						label="Порядок"
						name="order"
						type="number"
						min="0"
						:error-message="fieldErrors.order"
					/>
				</div>

				<div class="md:col-span-1 flex items-end">
					<CheckboxField
						v-model="form.is_active"
						label="Активно"
						name="is_active"
					/>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>

