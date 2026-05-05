<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import Button from '@/shared/ui/Button.vue'
	import TextField from '@/shared/ui/TextField.vue'

	import { permissionsApi } from '../api/permissions'
	import type { Permission } from '../types/permission'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()
	const props = defineProps<{ open: boolean; permission?: Permission | null }>()

	const saving = ref(false)
	const name = ref('')

	watch(
		() => [props.open, props.permission] as const,
		([open, permission]) => {
			if (!open) {
				name.value = ''
				return
			}

			name.value = permission?.name ?? ''
		}
	)

	const onSubmit = async () => {
		const value = name.value.trim()
		if (!value) return

		saving.value = true
		try {
			if (props.permission?.id) {
				await permissionsApi.updatePermission({ id: props.permission.id, name: value })
			} else {
				const payload: Permission = { id: null, name: value }
				await permissionsApi.createPermission(payload)
			}
			emit('saved')
			emit('close')
			name.value = ''
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-100000 mx-auto w-[92vw] max-w-xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.permission ? 'Редактировать permission' : 'Добавить permission' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Введите name и сохраните.</p>
				</div>
				<Button type="button" variant="ghost" size="icon" :on-click="() => $emit('close')" aria-label="Close">
					✕
				</Button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4" @submit.prevent="onSubmit">
				<TextField v-model.trim="name" label="Name *" name="name" placeholder="permission name" />

				<div class="mt-2 flex items-center justify-end gap-3">
					<Button type="button" variant="outline" size="sm" :on-click="() => $emit('close')">Отмена</Button>
					<Button type="submit" size="sm" :disabled="saving || !name" :loading="saving">
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</Button>
				</div>
			</form>
		</div>
	</Modal>
</template>

