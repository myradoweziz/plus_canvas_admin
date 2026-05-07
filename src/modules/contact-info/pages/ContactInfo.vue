<script setup lang="ts">
	import { onMounted, ref } from 'vue'

	import Banner from '@/shared/ui/Banner.vue'
	import Button from '@/shared/ui/Button.vue'

	import { contactInfoApi } from '@/modules/contact-info/api/contact-info'
	import type { ContactInfo } from '@/modules/contact-info/types/contact-info'

	import ContactInfoCreateModal from '../components/ContactInfoCreateModal.vue'
	import ContactInfoTable from '../components/ContactInfoTable.vue'

	const loading = ref(false)
	const error = ref(false)

	const rows = ref<ContactInfo[]>([])
	const showModal = ref(false)
	const selected = ref<ContactInfo | null>(null)

	const load = async () => {
		loading.value = true
		error.value = false
		try {
			const item = await contactInfoApi.getContactInfo()
			rows.value = item ? [item] : []
		} catch (e) {
			error.value = true
			rows.value = []
		} finally {
			loading.value = false
		}
	}

	const openEdit = () => {
		selected.value = rows.value[0] ?? null
		showModal.value = true
	}

	const editRow = (row: ContactInfo) => {
		selected.value = row
		showModal.value = true
	}

	const closeModal = () => {
		showModal.value = false
		selected.value = null
	}

	onMounted(() => {
		load()
	})
</script>

<template>
	<div class="space-y-6">
		<Banner title="Контактная информация" subtitle="Телефон, адрес, email и логотип для сайта." :total="rows.length">
			<template #actions>
				<div class="flex items-center gap-2">
					<Button type="button" variant="outline" size="sm" :disabled="loading" :on-click="load">Обновить</Button>
					<Button type="button" size="sm" :on-click="openEdit">
						{{ rows.length ? 'Редактировать' : 'Добавить' }}
					</Button>
				</div>
			</template>
		</Banner>

		<ContactInfoTable :rows="rows" :loading="loading" @edit="editRow" />

		<p v-if="error" class="text-sm text-red-600">Не удалось загрузить данные.</p>

		<ContactInfoCreateModal :open="showModal" :contact-info="selected" @close="closeModal" @saved="load" />
	</div>
</template>
