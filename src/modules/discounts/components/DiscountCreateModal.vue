<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-[100000] mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.discount ? 'Редактировать скидку' : 'Добавить скидку' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<button
					type="button"
					class="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
					@click="$emit('close')"
					aria-label="Close"
				>
					✕
				</button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField v-model.trim="form.title" label="Title *" name="title" placeholder="Title" />
				</div>

				<div class="md:col-span-1">
					<TextField v-model.number="form.order" label="Order" name="order" type="number" min="0" />
				</div>

				<div class="md:col-span-2">
					<TextareaField v-model.trim="form.description" label="Description" name="description" />
				</div>

				<div class="md:col-span-2">
					<ImageUpload v-model="imageFile" :current-url="form.image_url" />
				</div>

				<label class="flex items-center gap-2 md:col-span-2">
					<input v-model="form.is_active" type="checkbox" class="h-4 w-4" />
					<span class="text-sm text-gray-700">Active</span>
				</label>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<button
						type="button"
						class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
						@click="$emit('close')"
					>
						Отмена
					</button>
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
						:disabled="saving || !form.title"
					>
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</button>
				</div>
			</form>
		</div>
	</Modal>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import ImageUpload from '@/shared/ui/ImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { discountsApi } from '../api/discounts'
	import type { Discount } from '../types/discount'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; discount: Discount | null }>()

	const saving = ref(false)
	const imageFile = ref<File | null>(null)

	const form = ref<Discount>({
		id: null,
		title: '',
		description: '',
		image_url: '',
		is_active: false,
		order: 0
	})

	const resetForm = () => {
		form.value = { id: null, title: '', description: '', image_url: '', is_active: false, order: 0 }
		imageFile.value = null
	}

	watch(
		() => props.discount,
		(discount) => {
			if (!discount) {
				resetForm()
				return
			}

			form.value = {
				id: discount.id,
				title: discount.title,
				description: discount.description,
				image_url: discount.image_url,
				is_active: discount.is_active,
				order: discount.order
			}
			imageFile.value = null
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		saving.value = true
		try {
			const payload: Discount = {
				id: form.value.id,
				title: form.value.title,
				description: form.value.description,
				is_active: form.value.is_active,
				order: form.value.order,
				image: imageFile.value
			}

			if (props.discount?.id) {
				await discountsApi.updateDiscount(payload)
			} else {
				await discountsApi.createDiscount(payload)
			}

			emit('saved')
			emit('close')

			if (!props.discount) {
				resetForm()
			}
		} finally {
			saving.value = false
		}
	}
</script>

