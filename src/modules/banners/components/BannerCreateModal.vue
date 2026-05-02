<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import ImageUpload from '@/shared/ui/ImageUpload.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { bannersApi } from '../api/banners'
	import type { Banner } from '../types/banner'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'created'): void }>()

	const props = defineProps<{ open: boolean; banner: Banner | null }>()

	const saving = ref(false)
	const imageFile = ref<File | null>(null)

	const form = ref<Banner>({
		id: null,
		title: '',
		description: '',
		image_url: '',
		url: '',
		order: 0,
		is_active: false
	})

	const resetForm = () => {
		form.value = { id: null, title: '', description: '', image_url: '', url: '', order: 0, is_active: false }
		imageFile.value = null
	}

	watch(
		() => props.banner,
		(banner) => {
			if (!banner) {
				resetForm()
				return
			}

			form.value = {
				id: banner.id,
				title: banner.title,
				description: banner.description,
				image_url: banner.image_url,
				url: banner.url,
				order: banner.order,
				is_active: banner.is_active
			}
			imageFile.value = null
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		saving.value = true
		try {
			const payload: Banner = {
				id: form.value.id,
				title: form.value.title,
				description: form.value.description,
				url: form.value.url,
				order: form.value.order,
				is_active: form.value.is_active,
				image: imageFile.value
			}

			if (props.banner?.id) {
				await bannersApi.updateBanner(payload)
			} else {
				await bannersApi.createBanner(payload)
			}

			emit('created')
			emit('close')

			if (!props.banner) {
				resetForm()
			}
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ banner ? 'Редактировать баннер' : 'Добавить баннер' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField v-model.trim="form.title" label="Title" name="title" placeholder="Title" />
				</div>

				<div class="md:col-span-1">
					<TextField v-model.number="form.order" label="Order" name="order" type="number" min="0" />
				</div>

				<div class="md:col-span-2">
					<TextareaField v-model.trim="form.description" label="Description" name="description" />
				</div>

				<div class="md:col-span-2">
					<TextField v-model.trim="form.url" label="URL" name="url" placeholder="URL" />
				</div>

				<div class="md:col-span-2">
					<ImageUpload v-model="imageFile" :current-url="form.image_url" />
				</div>

				<CheckboxField v-model="form.is_active" label="Active" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || !form.title" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
