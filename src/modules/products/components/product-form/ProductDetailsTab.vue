<script setup lang="ts">
	import { defineAsyncComponent, watch } from 'vue'

	import Button from '@/shared/ui/Button.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import ProductRequiresSaveNotice from './ProductRequiresSaveNotice.vue'

	const RichTextEditor = defineAsyncComponent(() => import('@/shared/ui/RichTextEditor.vue'))

	import { api } from '../../api'
	import { useProductSubResourceSave } from '../../composables'
	import { createEmptyCanvasProductFaqItem, validateProductDetails } from '../../helpers'
	import type { CanvasProductDetails } from '../../types'

	const props = defineProps<{
		productId: number | null
	}>()

	const productDetails = defineModel<CanvasProductDetails>('productDetails', { required: true })

	const emit = defineEmits<{
		saved: [details: CanvasProductDetails]
	}>()

	const { saving, validationErrors, clearFieldError, runSave } = useProductSubResourceSave({
		validate: () => validateProductDetails(productDetails.value),
		save: () => api.updateCanvasProductDetails(props.productId!, productDetails.value),
		onSuccess: (savedDetails) => {
			productDetails.value = savedDetails
			emit('saved', savedDetails)
		},
		messages: {
			noProduct: 'Сначала сохраните продукт на вкладке Product Info',
			validation: 'Заполните обязательные поля информации',
			success: 'Информация успешно сохранены',
			error: 'Не удалось сохранить информацию'
		},
		fieldAliases: {
			'faq.*.question': 'faq.0.question',
			'faq.*.answer': 'faq.0.answer'
		}
	})

	watch(
		() => productDetails.value.description,
		() => clearFieldError('description')
	)

	watch(
		() => productDetails.value.faq,
		() => {
			productDetails.value.faq.forEach((_, index) => {
				clearFieldError(`faq.${index}.question`)
				clearFieldError(`faq.${index}.answer`)
			})
		},
		{ deep: true }
	)

	const addFaqItem = () => {
		productDetails.value = {
			...productDetails.value,
			faq: [...productDetails.value.faq, createEmptyCanvasProductFaqItem()]
		}
	}

	const removeFaqItem = (index: number) => {
		productDetails.value = {
			...productDetails.value,
			faq: productDetails.value.faq.filter((_, itemIndex) => itemIndex !== index)
		}
	}

	const updateFaqField = (index: number, field: 'question' | 'answer', value: string) => {
		const nextFaq = [...productDetails.value.faq]
		nextFaq[index] = { ...nextFaq[index], [field]: value }
		productDetails.value = { ...productDetails.value, faq: nextFaq }
		clearFieldError(`faq.${index}.${field}`)
	}

	const onSaveDetails = () => runSave(props.productId)
</script>

<template>
	<div class="contents">
		<ProductRequiresSaveNotice v-if="!productId" suffix=", затем заполните и сохраните информацию" />

		<div class="md:col-span-3">
			<RichTextEditor
				v-model="productDetails.description"
				label="Описание"
				required
				name="description"
				placeholder="Описание"
				:disabled="!productId"
				:error-message="validationErrors.description"
			/>
		</div>

		<div class="md:col-span-3">
			<TextareaField
				v-model.trim="productDetails.short_description"
				label="Краткое описание"
				name="short_description"
				placeholder="Краткое описание"
				:disabled="!productId"
			/>
		</div>

		<div class="md:col-span-3 space-y-4">
			<div class="flex items-center justify-between gap-3">
				<p class="text-sm font-semibold text-gray-900">FAQ</p>
				<Button type="button" size="sm" variant="outline" :disabled="!productId" :on-click="addFaqItem">
					Добавить FAQ
				</Button>
			</div>

			<p v-if="!productDetails.faq.length" class="text-sm text-gray-500">FAQ пока не добавлены.</p>

			<div
				v-for="(item, index) in productDetails.faq"
				:key="index"
				class="space-y-3 rounded-2xl border border-gray-200 bg-gray-50 p-4"
			>
				<div class="flex items-center justify-between gap-3">
					<p class="text-sm font-medium text-gray-800">FAQ #{{ index + 1 }}</p>
					<Button type="button" size="sm" variant="ghost" :disabled="!productId" :on-click="() => removeFaqItem(index)">
						Удалить
					</Button>
				</div>

				<TextField
					:model-value="item.question"
					label="Вопрос"
					:name="`faq_question_${index}`"
					placeholder="Вопрос"
					:disabled="!productId"
					:error-message="validationErrors[`faq.${index}.question`]"
					@update:model-value="(value) => updateFaqField(index, 'question', String(value ?? ''))"
				/>

				<TextareaField
					:model-value="item.answer"
					label="Ответ"
					:name="`faq_answer_${index}`"
					placeholder="Ответ"
					:disabled="!productId"
					:error-message="validationErrors[`faq.${index}.answer`]"
					@update:model-value="(value) => updateFaqField(index, 'answer', String(value ?? ''))"
				/>
			</div>
		</div>

		<div class="mt-2 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" size="sm" :disabled="!productId || saving" :loading="saving" :on-click="onSaveDetails">
				{{ saving ? 'Сохранение информации...' : 'Сохранить информацию' }}
			</Button>
		</div>
	</div>
</template>
