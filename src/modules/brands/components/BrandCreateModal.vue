<template>
	<Modal v-if="open" @close="$emit('close')">
		<div class="relative z-[100000] mx-auto w-[92vw] max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
			<div class="flex items-start justify-between gap-4">
				<div class="min-w-0">
					<h3 class="text-lg font-semibold text-gray-900">
						{{ props.brand ? 'Редактировать бренд' : 'Добавить бренд' }}
					</h3>
					<p class="mt-1 text-sm text-gray-600">Заполните поля и сохраните.</p>
				</div>
				<button
					type="button"
					class="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
					@click="$emit('close')"
					aria-label="Close"
				>
					✕
				</button>
			</div>

			<form class="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2" @submit.prevent="onSubmit">
				<div class="md:col-span-1">
					<TextField v-model.trim="form.name" label="Name *" name="name" placeholder="Name" />
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.trim="form.slug"
						label="Slug"
						name="slug"
						placeholder="Slug"
						@update:model-value="onSlugInput"
					/>
				</div>

				<div class="md:col-span-1">
					<TextField
						v-model.number="form.featured_order"
						label="Featured Order"
						name="featured_order"
						type="number"
						min="0"
					/>
				</div>

				<div class="flex flex-col gap-3 md:col-span-2">
					<label class="flex items-center gap-2">
						<input v-model="form.is_active" type="checkbox" class="h-4 w-4" />
						<span class="text-sm text-gray-700">Active</span>
					</label>
				</div>

				<div class="mt-2 flex items-center justify-end gap-3 md:col-span-2">
					<button
						type="button"
						class="rounded-lg px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
						@click="$emit('close')"
					>
						Отмена
					</button>
					<button
						type="submit"
						class="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
						:disabled="saving || !form.name"
					>
						{{ saving ? 'Сохранение...' : 'Сохранить' }}
					</button>
				</div>
			</form>
		</div>
	</Modal>
</template>

<script setup lang="ts">
	import { ref, watch } from 'vue'

	import Modal from '@/components/profile/Modal.vue'
	import TextField from '@/shared/ui/TextField.vue'
	import { brandsApi } from '../api/brands'
	import type { Brand } from '../types/brand'

	const emit = defineEmits<{ (e: 'close'): void; (e: 'saved'): void }>()

	const props = defineProps<{ open: boolean; brand: Brand | null }>()

	const saving = ref(false)
	const slugManuallyEdited = ref(false)
	const lastGeneratedSlug = ref('')

	const form = ref<Brand>({
		id: null,
		name: '',
		slug: '',
		is_active: false,
		featured_order: 0
	})

	const resetForm = () => {
		form.value = {
			id: null,
			name: '',
			slug: '',
			is_active: false,
			featured_order: 0
		}
	}

	const slugify = (value: string) => {
		const cyrillicMap: Record<string, string> = {
			а: 'a',
			б: 'b',
			в: 'v',
			г: 'g',
			д: 'd',
			е: 'e',
			ё: 'yo',
			ж: 'zh',
			з: 'z',
			и: 'i',
			й: 'y',
			к: 'k',
			л: 'l',
			м: 'm',
			н: 'n',
			о: 'o',
			п: 'p',
			р: 'r',
			с: 's',
			т: 't',
			у: 'u',
			ф: 'f',
			х: 'h',
			ц: 'ts',
			ч: 'ch',
			ш: 'sh',
			щ: 'sch',
			ъ: '',
			ы: 'y',
			ь: '',
			э: 'e',
			ю: 'yu',
			я: 'ya'
		}

		return value
			.toLowerCase()
			.split('')
			.map((char) => cyrillicMap[char] ?? char)
			.join('')
			.normalize('NFD')
			.replace(/[\u0300-\u036f]/g, '')
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/^-+|-+$/g, '')
	}

	watch(
		() => props.brand,
		(brand) => {
			if (!brand) {
				resetForm()
				slugManuallyEdited.value = false
				lastGeneratedSlug.value = ''
				return
			}

			form.value = {
				id: brand.id,
				name: brand.name,
				slug: brand.slug,
				is_active: brand.is_active,
				featured_order: brand.featured_order
			}
			lastGeneratedSlug.value = slugify(brand.name)
			slugManuallyEdited.value = Boolean(brand.slug && brand.slug !== lastGeneratedSlug.value)
		},
		{ immediate: true }
	)

	watch(
		() => form.value.name,
		(name) => {
			const generatedSlug = slugify(name)

			if (!slugManuallyEdited.value || !form.value.slug || form.value.slug === lastGeneratedSlug.value) {
				form.value.slug = generatedSlug
				slugManuallyEdited.value = false
			}

			lastGeneratedSlug.value = generatedSlug
		}
	)

	const onSlugInput = (value: string | number) => {
		form.value.slug = String(value)
		slugManuallyEdited.value = form.value.slug !== lastGeneratedSlug.value
	}

	const onSubmit = async () => {
		saving.value = true
		try {
			if (props.brand?.id) {
				await brandsApi.updateBrand(form.value)
			} else {
				await brandsApi.createBrand(form.value)
			}

			emit('saved')
			emit('close')

			if (!props.brand) {
				resetForm()
			}
		} finally {
			saving.value = false
		}
	}
</script>

