<script setup lang="ts">
	import { ref } from 'vue'
	import { toast } from 'vue3-toastify'

	import IconTrash from '@/shared/icons/TrashIcon.vue'
	import Button from '@/shared/ui/Button.vue'
	import CheckboxField from '@/shared/ui/CheckboxField.vue'
	import DeleteModal from '@/shared/ui/DeleteModal.vue'
	import SelectField from '@/shared/ui/SelectField.vue'
	import TextareaField from '@/shared/ui/TextareaField.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import ProductRequiresSaveNotice from './ProductRequiresSaveNotice.vue'

	import { api } from '../../api'
	import { useFieldErrors, useProductTabResource } from '../../composables'
	import {
		createEmptyCanvasProductComment,
		getErrorMessage,
		getValidationErrors,
		validateProductComment
	} from '../../helpers'
	import type { CanvasProductComment } from '../../types'

	const props = defineProps<{
		productId: number | null
	}>()

	const {
		items: comments,
		loading,
		load: loadComments
	} = useProductTabResource(
		() => props.productId,
		(id) => api.listCanvasProductComments(id),
		'Не удалось загрузить комментарии'
	)

	const savingId = ref<number | 'new' | null>(null)
	const { validationErrors, clearFieldError, setValidationErrors } = useFieldErrors()
	const deleteTarget = ref<CanvasProductComment | null>(null)
	const deleting = ref(false)

	const RATING_OPTIONS = [
		{ label: '1', value: 1 },
		{ label: '2', value: 2 },
		{ label: '3', value: 3 },
		{ label: '4', value: 4 },
		{ label: '5', value: 5 }
	]

	const rowKey = (comment: CanvasProductComment, index: number) => comment.id ?? `new-${index}`

	const addComment = () => {
		comments.value = [createEmptyCanvasProductComment(), ...comments.value]
	}

	const removeLocalComment = (index: number) => {
		comments.value = comments.value.filter((_, itemIndex) => itemIndex !== index)
	}

	const onSave = async (comment: CanvasProductComment, index: number) => {
		if (!props.productId) {
			toast.error('Сначала сохраните продукт на вкладке Product Info')
			return
		}

		const errors = validateProductComment(comment)
		setValidationErrors(errors)
		if (Object.keys(errors).length > 0) {
			toast.error(Object.values(errors)[0] || 'Исправьте ошибки в комментарии')
			return
		}

		savingId.value = comment.id ?? 'new'

		try {
			const saved = comment.id
				? await api.updateCanvasProductComment(props.productId, comment)
				: await api.createCanvasProductComment(props.productId, comment)

			comments.value[index] = saved
			toast.success(comment.id ? 'Комментарий обновлён' : 'Комментарий создан')
			await loadComments(true)
		} catch (error) {
			setValidationErrors(getValidationErrors(error))
			toast.error(getErrorMessage(error, 'Не удалось сохранить комментарий'))
		} finally {
			savingId.value = null
		}
	}

	const openDeleteModal = (comment: CanvasProductComment) => {
		deleteTarget.value = comment
	}

	const closeDeleteModal = () => {
		if (deleting.value) return
		deleteTarget.value = null
	}

	const confirmDelete = async () => {
		if (!props.productId || !deleteTarget.value?.id) return

		deleting.value = true

		try {
			await api.deleteCanvasProductComment(props.productId, deleteTarget.value.id)
			toast.success('Комментарий удалён')
			deleteTarget.value = null
			await loadComments(true)
		} catch (error) {
			toast.error(getErrorMessage(error, 'Не удалось удалить комментарий'))
		} finally {
			deleting.value = false
		}
	}
</script>

<template>
	<div class="contents">
		<ProductRequiresSaveNotice v-if="!productId" suffix=", затем управляйте комментариями" />

		<div class="md:col-span-3 flex items-center justify-between gap-3">
			<p class="text-sm text-gray-600">Отзывы и комментарии к продукту.</p>
			<Button type="button" variant="outline" size="sm" :disabled="!productId || loading" :on-click="addComment">
				Добавить комментарий
			</Button>
		</div>

		<div v-if="loading" class="md:col-span-3 text-sm text-gray-500">Загрузка комментариев...</div>

		<div
			v-else-if="productId && !comments.length"
			class="md:col-span-3 rounded-lg border border-dashed border-gray-200 px-4 py-8 text-center text-sm text-gray-500"
		>
			Комментариев пока нет. Нажмите «Добавить комментарий».
		</div>

		<div
			v-for="(comment, index) in comments"
			:key="rowKey(comment, index)"
			class="md:col-span-3 rounded-xl border border-gray-200 bg-gray-50 p-4"
		>
			<div class="mb-3 flex items-center justify-between gap-2">
				<p class="text-sm font-semibold text-gray-900">
					{{ comment.id ? `Комментарий #${comment.id}` : 'Новый комментарий' }}
				</p>
				<div class="flex items-center gap-2">
					<Button
						v-if="!comment.id"
						type="button"
						variant="ghost"
						size="sm"
						:disabled="!productId"
						:on-click="() => removeLocalComment(index)"
					>
						Отмена
					</Button>
					<Button
						v-else
						type="button"
						variant="ghost"
						size="sm"
						:disabled="!productId"
						:on-click="() => openDeleteModal(comment)"
					>
						<IconTrash size="16" class="text-gray-500 hover:text-red-600" />
					</Button>
				</div>
			</div>

			<div class="grid grid-cols-1 gap-4 md:grid-cols-3">
				<TextField
					v-model.trim="comment.author_name"
					label="Автор"
					required
					:name="`comment_author_${rowKey(comment, index)}`"
					placeholder="John Doe"
					:disabled="!productId"
					:error-message="validationErrors.author_name"
					@update:model-value="() => clearFieldError('author_name')"
				/>

				<SelectField
					v-model="comment.rating"
					label="Рейтинг"
					required
					:name="`comment_rating_${rowKey(comment, index)}`"
					:options="RATING_OPTIONS"
					:disabled="!productId"
					:error-message="validationErrors.rating"
					@update:model-value="() => clearFieldError('rating')"
				/>

				<div class="flex items-end pb-1">
					<CheckboxField
						v-model="comment.is_active"
						label="Активен"
						:name="`comment_active_${rowKey(comment, index)}`"
						:disabled="!productId"
					/>
				</div>

				<div class="md:col-span-3">
					<TextareaField
						v-model.trim="comment.comment"
						label="Комментарий"
						required
						:name="`comment_text_${rowKey(comment, index)}`"
						placeholder="This is a great product!"
						:disabled="!productId"
						:error-message="validationErrors.comment"
						@update:model-value="() => clearFieldError('comment')"
					/>
				</div>
			</div>

			<div class="mt-4 flex justify-end">
				<Button
					type="button"
					size="sm"
					:disabled="!productId || savingId === (comment.id ?? 'new')"
					:loading="savingId === (comment.id ?? 'new')"
					:on-click="() => onSave(comment, index)"
				>
					{{ comment.id ? 'Сохранить' : 'Создать' }}
				</Button>
			</div>
		</div>

		<DeleteModal
			:open="!!deleteTarget"
			entity-name="комментарий"
			:loading="deleting"
			@close="closeDeleteModal"
			@confirm="confirmDelete"
		/>
	</div>
</template>
