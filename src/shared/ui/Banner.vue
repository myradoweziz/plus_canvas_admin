<template>
	<section class="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
		<div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
			<div>
				<div class="flex min-w-0 items-start gap-4">
					<div
						v-if="icon"
						class="mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-700"
						aria-hidden="true"
					>
						<component :is="icon" class="h-6 w-6" />
					</div>

					<div class="min-w-0">
						<h1 class="text-xl font-semibold text-gray-900 md:text-2xl">
							{{ title }}
						</h1>
						<p v-if="subtitle" class="mt-1 text-sm text-gray-600 md:text-base">
							{{ subtitle }}
						</p>
					</div>
				</div>

				<div class="text-sm text-gray-600 md:text-base">Всего: {{ total || '-' }}</div>
			</div>

			<div v-if="$slots.actions" class="shrink-0">
				<slot name="actions" />
			</div>
		</div>
	</section>
</template>

<script setup lang="ts">
	withDefaults(
		defineProps<{
			title: string
			subtitle?: string
			icon?: any
			total?: number | string
		}>(),
		{
			subtitle: '',
			icon: undefined,
			total: undefined
		}
	)
</script>
