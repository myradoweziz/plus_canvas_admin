<template>
	<div
		v-if="total > 0"
		class="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
	>
		<p class="text-sm text-gray-600">
			Показано {{ fromItem }}-{{ toItem }} из {{ total }}
		</p>

		<div class="flex items-center gap-2">
			<button
				type="button"
				class="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
				:disabled="offset <= 0"
				@click="goToPrevious"
			>
				Назад
			</button>
			<span class="px-2 text-sm text-gray-600">{{ currentPage }} / {{ totalPages }}</span>
			<button
				type="button"
				class="rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
				:disabled="isLastPage"
				@click="goToNext"
			>
				Вперёд
			</button>
		</div>
	</div>
</template>

<script setup lang="ts">
	import { computed } from 'vue'

	const props = withDefaults(
		defineProps<{
			total: number
			limit: number
			offset: number
		}>(),
		{
			total: 0,
			limit: 15,
			offset: 0
		}
	)

	const emit = defineEmits<{
		(e: 'update:offset', value: number): void
	}>()

	const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.limit)))
	const currentPage = computed(() => props.offset + 1)
	const fromItem = computed(() => (props.total === 0 ? 0 : props.offset * props.limit + 1))
	const toItem = computed(() => Math.min((props.offset + 1) * props.limit, props.total))
	const isLastPage = computed(() => props.offset + 1 >= totalPages.value)

	const goToPrevious = () => {
		emit('update:offset', Math.max(0, props.offset - 1))
	}

	const goToNext = () => {
		emit('update:offset', props.offset + 1)
	}
</script>

