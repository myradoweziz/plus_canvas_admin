<script setup lang="ts">
	import { reactive, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { getFirstBackendValidationMessage } from '@/shared/api/validation'
	import { api } from '../api'
	import type { CountryState } from '../types'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{
		open: boolean
		countryId: number
		state: CountryState | null
	}>()

	const saving = ref(false)

	const form = reactive({
		id: null as number | null,
		name: '',
		abbreviation: '',
		published: true,
		display_order: 0
	})

	const fieldErrors = reactive({
		name: '',
		abbreviation: ''
	})

	const resetLocalForm = () => {
		Object.assign(form, {
			id: null,
			name: '',
			abbreviation: '',
			published: true,
			display_order: 0
		})
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})
	}

	const validate = () => {
		Object.keys(fieldErrors).forEach((key) => {
			fieldErrors[key as keyof typeof fieldErrors] = ''
		})

		let ok = true
		if (!form.name.trim()) {
			fieldErrors.name = 'Укажите название'
			ok = false
		}
		if (!form.abbreviation.trim()) {
			fieldErrors.abbreviation = 'Укажите сокращение'
			ok = false
		}
		return ok
	}

	watch(
		() => [props.open, props.state] as const,
		([open, state]) => {
			if (!open) return
			if (!state) {
				resetLocalForm()
				return
			}

			Object.assign(form, {
				id: state.id ?? null,
				name: state.name ?? '',
				abbreviation: state.abbreviation ?? '',
				published: !!state.published,
				display_order: Number(state.display_order) || 0
			})
			Object.keys(fieldErrors).forEach((key) => {
				fieldErrors[key as keyof typeof fieldErrors] = ''
			})
		},
		{ immediate: true }
	)

	const onSubmit = async () => {
		if (!validate()) return

		saving.value = true
		try {
			const payload: CountryState = {
				id: form.id ?? null,
				name: form.name.trim(),
				abbreviation: form.abbreviation.trim(),
				published: !!form.published,
				display_order: Number(form.display_order) || 0
			}

			if (payload.id) {
				await api.updateCountryState(props.countryId, payload)
				toast.success('Регион обновлён')
			} else {
				await api.createCountryState(props.countryId, payload)
				toast.success('Регион добавлен')
			}

			emit('saved')
			emit('close')

			if (!props.state) resetLocalForm()
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
				<h3 class="text-lg font-semibold text-gray-900">
					{{ state ? 'Редактировать регион' : 'Добавить регион' }}
				</h3>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">✕</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4" @submit.prevent="onSubmit">
				<TextField
					v-model="form.name"
					label="Название"
					required
					name="name"
					placeholder="Название региона"
					:error-message="fieldErrors.name"
				/>

				<TextField
					v-model="form.abbreviation"
					label="Сокращение"
					required
					name="abbreviation"
					placeholder="CA"
					:error-message="fieldErrors.abbreviation"
				/>

				<TextField
					v-model.number="form.display_order"
					label="Порядок отображения"
					name="display_order"
					type="number"
					min="0"
					step="1"
				/>

				<CheckboxField v-model="form.published" label="Опубликован" name="published" />

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
