<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { faqsApi } from '../api/faqs'
	import type { Faq } from '../types/faq'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; faq: Faq | null }>()

	const saving = ref(false)

	const form = ref<Faq>({
		id: null,
		question: '',
		answer: '',
		order: 0,
		is_active: true
	})

	const resetForm = () => {
		form.value = {
			id: null,
			question: '',
			answer: '',
			order: 0,
			is_active: true
		}
	}

	watch(
		() => props.faq,
		(faq) => {
			if (!faq) {
				resetForm()
				return
			}

			form.value = {
				id: faq.id,
				question: faq.question,
				answer: faq.answer,
				order: faq.order,
				is_active: faq.is_active
			}
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.faq?.id) {
				await faqsApi.updateFaq(form.value)
			} else {
				await faqsApi.createFaq(form.value)
			}

			emit('saved')
			emit('close')

			if (!props.faq) resetForm()
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
					<TextField v-model.trim="form.question" label="Question *" name="question" placeholder="Question" />
				</div>

				<div class="md:col-span-2">
					<TextareaField
						v-model.trim="form.answer"
						label="Answer *"
						name="answer"
						placeholder="Answer"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField v-model.number="form.order" label="Order" name="order" type="number" min="0" />
				</div>

				<div class="md:col-span-1 flex items-end">
					<CheckboxField v-model="form.is_active" label="Active" name="is_active" />
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || !form.question || !form.answer" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>

