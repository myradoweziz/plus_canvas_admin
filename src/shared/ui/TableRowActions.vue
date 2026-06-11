<script setup lang="ts">
	import Button from '@/shared/ui/Button.vue'

	import { EditIcon, TrashIcon } from '@/shared/icons'

	withDefaults(
		defineProps<{
			showEdit?: boolean
			showDelete?: boolean
			editLabel?: string
			deleteLabel?: string
		}>(),
		{
			showEdit: false,
			showDelete: true,
			editLabel: 'Редактировать',
			deleteLabel: 'Удалить'
		}
	)

	const emit = defineEmits<{
		edit: []
		delete: []
	}>()
</script>

<template>
	<div class="flex items-center justify-end gap-2" @click.stop>
		<Button
			v-if="showEdit"
			type="button"
			variant="ghost"
			size="icon"
			class-name="hover:bg-green-100"
			:aria-label="editLabel"
			:on-click="() => emit('edit')"
		>
			<EditIcon />
		</Button>
		<Button
			v-if="showDelete"
			type="button"
			variant="ghost"
			size="icon"
			class-name="hover:text-red-700"
			:aria-label="deleteLabel"
			:on-click="() => emit('delete')"
		>
			<TrashIcon />
		</Button>
	</div>
</template>
