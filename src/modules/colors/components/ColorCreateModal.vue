<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import ColorPicker from '@/shared/ui/ColorPicker.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { colorsApi } from '../api/colors'
	import type { Color } from '../types/color'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; color: Color | null }>()

	const saving = ref(false)

	const form = ref<Color>({
		id: null,
		name: '',
		hex_code: '#000000',
		is_active: false
	})

	const resetForm = () => {
		form.value = {
			id: null,
			name: '',
			hex_code: '#000000',
			is_active: false
		}
	}

	watch(
		() => props.color,
		(color) => {
			if (!color) {
				resetForm()
				return
			}

			form.value = {
				id: color.id,
				name: color.name,
				hex_code: color.hex_code,
				is_active: color.is_active
			}
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.color?.id) {
				await colorsApi.updateColor(form.value)
			} else {
				await colorsApi.createColor(form.value)
			}

			emit('saved')
			emit('close')

			if (!props.color) {
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
						{{ color ? 'Редактировать цвет' : 'Добавить цвет' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField v-model.trim="form.name" label="Название *" name="name" placeholder="Название" />
				</div>

				<div class="md:col-span-1">
					<ColorPicker v-model="form.hex_code" label="Цвет *" name="hex_code" />
				</div>

				<CheckboxField v-model="form.is_active" label="Активно" name="is_active" class="md:col-span-2" />

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<Button type="button" variant="outline" size="sm" @click="$emit('close')"> Отмена </Button>
					<Button type="submit" size="sm" :disabled="saving || !form.name || !form.hex_code" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>
