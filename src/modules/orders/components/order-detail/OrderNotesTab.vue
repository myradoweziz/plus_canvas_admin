<script setup lang="ts">
	import { ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import { TrashIcon } from '@/shared/icons'
	import { mediaApi } from '@/shared/api/media'
	import { getErrorMessage, getValidationErrors } from '@/shared/api/errors'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import SingleImageUpload from '@/shared/ui/SingleImageUpload.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'

	import { useFieldErrors } from '@/modules/products/composables'
	import { api } from '../../api'
	import { formatOrderDate } from '../../helpers/order-display'
	import type { OrderNote } from '../../types'

	const props = defineProps<{
		orderId: number
		notes: OrderNote[]
	}>()

	const emit = defineEmits<{
		(e: 'noteCreated', note: OrderNote): void
		(e: 'noteDeleted', noteId: number): void
	}>()

	const creating = ref(false)
	const deletingNoteId = ref<number | null>(null)
	const showDeleteModal = ref(false)
	const selectedNote = ref<OrderNote | null>(null)
	const { validationErrors, clearFieldError, setValidationErrors, clearAllValidationErrors } = useFieldErrors()

	const attachedFilePreviewUrl = ref('')

	const form = ref({
		note: '',
		display_to_customer: true,
		attached_file: ''
	})

	watch(attachedFilePreviewUrl, (value) => {
		if (!value) form.value.attached_file = ''
	})

	const uploadAttachedFile = async (files: File[], onProgress: (percent: number) => void) => {
		const uploaded = await mediaApi.uploadImages(files, onProgress)
		const file = uploaded[0]

		if (file) {
			form.value.attached_file = file.path || file.url
			attachedFilePreviewUrl.value = file.url
		}

		return uploaded
	}

	const resetForm = () => {
		form.value = {
			note: '',
			display_to_customer: true,
			attached_file: ''
		}
		attachedFilePreviewUrl.value = ''
	}

	const attachedFileHref = (value: string | null) => {
		if (!value) return ''
		if (value.startsWith('http://') || value.startsWith('https://')) return value
		return ''
	}

	const createNote = async () => {
		if (!form.value.note.trim()) {
			setValidationErrors({ note: 'Введите текст заметки' })
			return
		}

		creating.value = true
		clearAllValidationErrors()

		try {
			const created = await api.createOrderNote(props.orderId, {
				note: form.value.note.trim(),
				display_to_customer: form.value.display_to_customer,
				attached_file: form.value.attached_file.trim()
			})
			emit('noteCreated', created)
			resetForm()
			toast.success('Заметка добавлена')
		} catch (error) {
			setValidationErrors(getValidationErrors(error))
			toast.error(getErrorMessage(error, 'Не удалось добавить заметку'))
		} finally {
			creating.value = false
		}
	}

	const openDeleteModal = (note: OrderNote) => {
		selectedNote.value = note
		showDeleteModal.value = true
	}

	const closeDeleteModal = () => {
		showDeleteModal.value = false
		selectedNote.value = null
	}

	const confirmDelete = async () => {
		if (!selectedNote.value) return

		deletingNoteId.value = selectedNote.value.id

		try {
			await api.deleteOrderNote(props.orderId, selectedNote.value.id)
			emit('noteDeleted', selectedNote.value.id)
			toast.success('Заметка удалена')
			closeDeleteModal()
		} catch (error) {
			toast.error(getErrorMessage(error, 'Не удалось удалить заметку'))
		} finally {
			deletingNoteId.value = null
		}
	}
</script>

<template>
	<div class="space-y-6">
		<form class="space-y-4 rounded-xl border border-gray-200 bg-gray-50 p-4" @submit.prevent="createNote">
			<h4 class="text-sm font-semibold text-gray-900">Новая заметка</h4>

			<TextareaField
				v-model="form.note"
				label="Текст"
				name="note"
				placeholder="Текст заметки"
				:error-message="validationErrors.note"
				@update:model-value="clearFieldError('note')"
			/>

			<CheckboxField v-model="form.display_to_customer" label="Показывать клиенту" name="display_to_customer" />

			<SingleImageUpload
				v-model="attachedFilePreviewUrl"
				label="Прикреплённый файл"
				description="Необязательно. После загрузки в заказ сохранится путь к файлу."
				button-text="Загрузить файл"
				accept="*/*"
				:error-message="validationErrors.attached_file"
				:uploader="uploadAttachedFile"
				@update:model-value="clearFieldError('attached_file')"
			/>

			<div class="flex justify-end">
				<Button type="submit" size="sm" :disabled="creating">
					{{ creating ? 'Добавление...' : 'Добавить' }}
				</Button>
			</div>
		</form>

		<div v-if="!notes.length" class="text-sm text-gray-600">Заметок пока нет.</div>

		<ul v-else class="space-y-3">
			<li
				v-for="note in notes"
				:key="note.id"
				class="flex items-start justify-between gap-4 rounded-xl border border-gray-200 p-4"
			>
				<div class="min-w-0 flex-1 space-y-2">
					<p class="text-sm text-gray-900">{{ note.note }}</p>
					<div class="flex flex-wrap gap-3 text-xs text-gray-500">
						<span>{{ formatOrderDate(note.created_at) }}</span>
						<span>{{ note.display_to_customer ? 'Видно клиенту' : 'Только для админа' }}</span>
						<a
							v-if="attachedFileHref(note.attached_file)"
							:href="attachedFileHref(note.attached_file)"
							target="_blank"
							rel="noopener noreferrer"
							class="text-blue-600 hover:underline"
						>
							Файл
						</a>
						<span v-else-if="note.attached_file">{{ note.attached_file }}</span>
					</div>
				</div>

				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="shrink-0 hover:text-red-700"
					aria-label="Удалить"
					:disabled="deletingNoteId === note.id"
					:on-click="() => openDeleteModal(note)"
				>
					<TrashIcon />
				</Button>
			</li>
		</ul>

		<DeleteModal
			:open="showDeleteModal"
			entity-name="заметку"
			:loading="deletingNoteId !== null"
			@close="closeDeleteModal"
			@confirm="confirmDelete"
		/>
	</div>
</template>
