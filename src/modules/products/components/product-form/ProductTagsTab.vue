<script setup lang="ts">
	import { computed, onMounted, ref } from 'vue'

	import Button from '@/shared/ui/Button.vue'
	import SelectField from '@/shared/ui/SelectField.vue'

	import { toast } from 'vue3-toastify'

	import { productTagsApi } from '@/modules/product-tags/api/productTags'
	import type { ProductTag } from '@/modules/product-tags/types/productTag'
	import { api } from '../../api'
	import type { CanvasProduct } from '../../types/product'

	const form = defineModel<CanvasProduct>('form', { required: true })

	const loading = ref(false)
	const productTags = ref<ProductTag[]>([])

	const loadTags = async () => {
		loading.value = true
		try {
			const result = await productTagsApi.listProductTags({ limit: 1000, offset: 0 })
			productTags.value = result.items || []
		} finally {
			loading.value = false
		}
	}

	onMounted(loadTags)

	const productTagOptions = computed(() =>
		productTags.value
			.filter((tag) => tag.id !== null && !form.value.product_tags.includes(tag.id))
			.map((tag) => ({ label: tag.name, value: tag.id }))
	)

	const selectedProductTags = computed(() =>
		form.value.product_tags.map((id) => ({
			id,
			label: productTags.value.find((tag) => tag.id === id)?.name ?? `#${id}`
		}))
	)

	const selectedProductTagId = ref<number | null>(null)

	const addProductTag = (value: string | number | null) => {
		selectedProductTagId.value = null
		if (value === null) return

		const id = Number(value)
		if (Number.isFinite(id) && !form.value.product_tags.includes(id)) {
			form.value.product_tags.push(id)
		}
	}

	const removeProductTag = (id: number) => {
		form.value.product_tags = form.value.product_tags.filter((item) => item !== id)
	}

	const saving = ref(false)

	const onSave = async () => {
		if (!form.value.id) {
			toast.error('Сначала сохраните продукт на вкладке Product Info')
			return
		}

		saving.value = true
		try {
			await api.updateCanvasProduct(form.value)
			toast.success('Теги товаров успешно сохранены')
		} catch (error) {
			toast.error('Не удалось сохранить теги товаров')
		} finally {
			saving.value = false
		}
	}
</script>

<template>
	<div class="contents">
		<div
			v-if="!form.id"
			class="md:col-span-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 mb-4"
		>
			Сначала сохраните продукт на вкладке <strong>Product Info</strong>, затем настройте теги товаров.
		</div>

		<div class="col-span-full md:col-span-3">
		<SelectField
			:model-value="selectedProductTagId"
			label="Теги товара"
			name="product_tags"
			placeholder="Выберите тег"
			:options="productTagOptions"
			:disabled="loading"
			@update:model-value="addProductTag"
		/>
		<div v-if="selectedProductTags.length" class="mt-3 flex flex-wrap gap-2">
			<span
				v-for="tag in selectedProductTags"
				:key="tag.id"
				class="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
			>
				{{ tag.label }}
				<Button
					type="button"
					variant="ghost"
					size="icon"
					class-name="h-5 w-5 text-blue-500 hover:text-red-600"
					:on-click="() => removeProductTag(tag.id)"
				>
					✕
				</Button>
			</span>
		</div>

		<div class="mt-4 flex items-center justify-end gap-3 md:col-span-3">
			<Button type="button" size="sm" :disabled="!form.id || saving" :loading="saving" :on-click="onSave">
				{{ saving ? 'Сохранение...' : 'Сохранить теги' }}
			</Button>
		</div>
		</div>
	</div>
</template>
