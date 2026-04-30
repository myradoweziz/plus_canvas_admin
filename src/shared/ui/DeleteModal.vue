<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-[100000] mx-auto w-[92vw] max-w-md rounded-2xl bg-white p-6 shadow-xl">
			<h3 class="text-center text-lg font-semibold text-gray-900">Хотите удалить ?</h3>

			<div class="mt-6 flex items-center justify-center gap-3">
				<button
					type="button"
					class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
					@click="$emit('close')"
				>
					{{ cancelText }}
				</button>
				<button
					type="button"
					class="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
					:disabled="loading"
					@click="$emit('confirm')"
				>
					{{ loading ? loadingText : confirmText }}
				</button>
			</div>
		</div>
	</Modal>
</template>

<script setup lang="ts">
	import Modal from '@/components/profile/Modal.vue'

	withDefaults(
		defineProps<{
			open: boolean
			entityName?: string
			loading?: boolean
			cancelText?: string
			confirmText?: string
			loadingText?: string
		}>(),
		{
			entityName: 'элемент',
			loading: false,
			cancelText: 'Отмена',
			confirmText: 'Удалить',
			loadingText: 'Удаление...'
		}
	)

	defineEmits<{
		(e: 'close'): void
		(e: 'confirm'): void
	}>()
</script>
