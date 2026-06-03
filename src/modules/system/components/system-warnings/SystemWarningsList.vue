<script setup lang="ts">
	import StatusBadge from '@/shared/ui/StatusBadge.vue'

	import { SYSTEM_WARNING_TONE_CLASS, SYSTEM_WARNING_TYPE_LABEL } from '../../helpers'
	import type { SystemWarning } from '../../types'

	defineProps<{
		items: SystemWarning[]
		loading: boolean
	}>()
</script>

<template>
	<section class="rounded-2xl border border-gray-200 bg-white">
		<div v-if="loading" class="px-4 py-6 text-sm text-gray-600">Загрузка...</div>
		<div v-else-if="!items.length" class="px-4 py-6 text-sm text-gray-600">Системных уведомлений нет.</div>
		<ul v-else class="divide-y divide-gray-200">
			<li v-for="(item, index) in items" :key="`${item.type}-${item.title}-${index}`" class="px-4 py-4">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div class="min-w-[405px] space-y-2">
						<div class="flex flex-wrap items-center gap-2">
							<StatusBadge :tone-class="SYSTEM_WARNING_TONE_CLASS[item.type]">
								{{ SYSTEM_WARNING_TYPE_LABEL[item.type] }}
							</StatusBadge>
							<h3 class="text-base font-semibold text-gray-900">{{ item.title }}</h3>
						</div>
						<p class="text-sm text-gray-700">{{ item.message }}</p>
					</div>
					<div class="shrink-0 rounded-xl bg-gray-50 px-4 py-2 text-center ring-1 ring-gray-200">
						<p class="text-xs uppercase tracking-wide text-gray-500">Количество</p>
						<p class="text-xl font-semibold text-gray-900">{{ item.count }}</p>
					</div>
				</div>
			</li>
		</ul>
	</section>
</template>
