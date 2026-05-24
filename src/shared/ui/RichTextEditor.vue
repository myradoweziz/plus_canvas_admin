<script setup lang="ts">
	import { EditorContent, useEditor } from '@tiptap/vue-3'
	import { computed, onBeforeUnmount, ref, watch } from 'vue'
	import { toast } from 'vue3-toastify'

	import { mediaApi } from '@/shared/api/media'
	import { createRichTextExtensions } from './rich-text-editor/createExtensions'

	defineOptions({
		inheritAttrs: false
	})

	const props = withDefaults(
		defineProps<{
			label: string
			name: string
			modelValue?: string
			placeholder?: string
			errorMessage?: string
			required?: boolean
			disabled?: boolean
		}>(),
		{
			modelValue: '',
			placeholder: '',
			required: false,
			disabled: false
		}
	)

	const emit = defineEmits<{
		'update:modelValue': [value: string]
	}>()

	const imageInputRef = ref<HTMLInputElement | null>(null)
	const uploadingImage = ref(false)

	const editor = useEditor({
		content: props.modelValue || '',
		extensions: createRichTextExtensions({ placeholder: props.placeholder || 'Введите текст...' }),
		editable: !props.disabled,
		editorProps: {
			attributes: {
				class: 'rich-text-editor__content px-4 py-3 text-sm text-gray-900',
				'data-placeholder': props.placeholder || 'Введите текст...'
			}
		},
		onUpdate: ({ editor: currentEditor }) => {
			emit('update:modelValue', currentEditor.getHTML())
		}
	})

	const headingLevel = computed(() => {
		if (!editor.value) return '0'
		for (let level = 1; level <= 6; level += 1) {
			if (editor.value.isActive('heading', { level })) return String(level)
		}
		return '0'
	})

	const currentFontFamily = computed(() => {
		if (!editor.value) return ''
		return (editor.value.getAttributes('textStyle').fontFamily as string) || ''
	})

	const currentColor = computed(() => {
		if (!editor.value) return '#111827'
		return (editor.value.getAttributes('textStyle').color as string) || '#111827'
	})

	const btnClass = (active = false) =>
		[
			'rounded-lg border px-2 py-1 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-50',
			active ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
		].join(' ')

	const run = (callback: () => void) => {
		if (!editor.value || props.disabled) return
		callback()
	}

	const setHeading = (event: Event) => {
		const value = (event.target as HTMLSelectElement).value
		run(() => {
			if (value === '0') {
				editor.value?.chain().focus().setParagraph().run()
				return
			}
			editor.value
				?.chain()
				.focus()
				.toggleHeading({ level: Number(value) as 1 | 2 | 3 | 4 | 5 | 6 })
				.run()
		})
	}

	const setFontFamily = (event: Event) => {
		const value = (event.target as HTMLSelectElement).value
		run(() => {
			if (!value) {
				editor.value?.chain().focus().unsetFontFamily().run()
				return
			}
			editor.value?.chain().focus().setFontFamily(value).run()
		})
	}

	const setColor = (event: Event) => {
		const value = (event.target as HTMLInputElement).value
		run(() => {
			editor.value?.chain().focus().setColor(value).run()
		})
	}

	const setLink = () => {
		if (!editor.value) return
		const previousUrl = editor.value.getAttributes('link').href as string | undefined
		const url = window.prompt('URL ссылки', previousUrl || 'https://')

		if (url === null) return

		if (url === '') {
			editor.value.chain().focus().extendMarkRange('link').unsetLink().run()
			return
		}

		editor.value.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
	}

	const pickImage = () => {
		if (props.disabled || uploadingImage.value) return
		imageInputRef.value?.click()
	}

	const onImageSelected = async (event: Event) => {
		const input = event.target as HTMLInputElement
		const file = input.files?.[0]
		input.value = ''

		if (!file || !editor.value) return

		uploadingImage.value = true

		try {
			const [media] = await mediaApi.uploadImages([file])
			const src = media.url || media.path
			if (!src) {
				toast.error('Не удалось получить URL изображения')
				return
			}
			editor.value.chain().focus().setImage({ src }).run()
		} catch {
			toast.error('Не удалось загрузить изображение')
		} finally {
			uploadingImage.value = false
		}
	}

	watch(
		() => props.modelValue,
		(value) => {
			if (!editor.value) return
			const current = editor.value.getHTML()
			if ((value || '') !== current) {
				editor.value.commands.setContent(value || '', { emitUpdate: false })
			}
		}
	)

	watch(
		() => props.disabled,
		(disabled) => {
			editor.value?.setEditable(!disabled)
		}
	)

	onBeforeUnmount(() => {
		editor.value?.destroy()
	})

	const FONT_OPTIONS = [
		{ label: 'По умолчанию', value: '' },
		{ label: 'Inter', value: 'Inter, sans-serif' },
		{ label: 'Arial', value: 'Arial, sans-serif' },
		{ label: 'Georgia', value: 'Georgia, serif' },
		{ label: 'Times New Roman', value: '"Times New Roman", serif' },
		{ label: 'Courier New', value: '"Courier New", monospace' }
	]
</script>

<template>
	<div class="rich-text-editor">
		<label class="mb-1.5 block text-sm font-medium text-gray-700">
			{{ label }} <span v-if="required" class="text-red-500">*</span>
		</label>

		<div
			:class="[
				'overflow-hidden rounded-xl border bg-white shadow-sm transition-all duration-300',
				errorMessage
					? 'border-red-500 ring-4 ring-red-100'
					: 'border-gray-200 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10',
				disabled ? 'opacity-60' : ''
			]"
		>
			<div
				v-if="editor"
				class="flex flex-wrap items-center gap-1 border-b border-gray-200 bg-gray-50 p-2"
				role="toolbar"
				aria-label="Панель форматирования"
			>
				<select
					class="rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
					:value="headingLevel"
					:disabled="disabled"
					title="Стиль текста"
					@change="setHeading"
				>
					<option value="0">Абзац</option>
					<option value="1">Заголовок 1</option>
					<option value="2">Заголовок 2</option>
					<option value="3">Заголовок 3</option>
					<option value="4">Заголовок 4</option>
					<option value="5">Заголовок 5</option>
					<option value="6">Заголовок 6</option>
				</select>

				<select
					class="max-w-[9rem] rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
					:value="currentFontFamily"
					:disabled="disabled"
					title="Шрифт"
					@change="setFontFamily"
				>
					<option v-for="font in FONT_OPTIONS" :key="font.value || 'default'" :value="font.value">
						{{ font.label }}
					</option>
				</select>

				<label
					class="flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs text-gray-700"
					title="Цвет текста"
				>
					<span>Цвет</span>
					<input
						type="color"
						class="h-5 w-5 cursor-pointer border-0 bg-transparent p-0"
						:value="currentColor"
						:disabled="disabled"
						@input="setColor"
					/>
				</label>

				<span class="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />

				<button
					type="button"
					:class="btnClass(editor.isActive('bold'))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().toggleBold().run())"
				>
					B
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive('italic'))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().toggleItalic().run())"
				>
					<i>I</i>
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive('underline'))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().toggleUnderline().run())"
				>
					<u>U</u>
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive('strike'))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().toggleStrike().run())"
				>
					S
				</button>

				<button
					type="button"
					:class="btnClass(editor.isActive('highlight'))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().toggleHighlight().run())"
				>
					HL
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive('subscript'))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().toggleSubscript().run())"
				>
					X₂
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive('superscript'))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().toggleSuperscript().run())"
				>
					X²
				</button>

				<span class="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />

				<button
					type="button"
					:class="btnClass(editor.isActive({ textAlign: 'left' }))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().setTextAlign('left').run())"
				>
					⬅
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive({ textAlign: 'center' }))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().setTextAlign('center').run())"
				>
					↔
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive({ textAlign: 'right' }))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().setTextAlign('right').run())"
				>
					➡
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive({ textAlign: 'justify' }))"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().setTextAlign('justify').run())"
				>
					≡
				</button>

				<span class="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />

				<button
					type="button"
					:class="btnClass(editor.isActive('bulletList'))"
					:disabled="disabled"
					title="Маркированный список"
					@click="run(() => editor?.chain().focus().toggleBulletList().run())"
				>
					<span class="inline-flex items-center gap-1.5">
						<svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
							<circle cx="2" cy="4" r="1.25" />
							<circle cx="2" cy="8" r="1.25" />
							<circle cx="2" cy="12" r="1.25" />
							<rect x="5" y="3" width="9" height="2" rx="1" />
							<rect x="5" y="7" width="9" height="2" rx="1" />
							<rect x="5" y="11" width="9" height="2" rx="1" />
						</svg>
						Маркированный
					</span>
				</button>
				<button
					type="button"
					:class="btnClass(editor.isActive('orderedList'))"
					:disabled="disabled"
					title="Нумерованный список"
					@click="run(() => editor?.chain().focus().toggleOrderedList().run())"
				>
					<span class="inline-flex items-center gap-1.5">
						<svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
							<rect x="1" y="2" width="3" height="3" rx="0.5" />
							<rect x="1" y="6.5" width="3" height="3" rx="0.5" />
							<rect x="1" y="11" width="3" height="3" rx="0.5" />
							<rect x="6" y="3" width="9" height="2" rx="1" />
							<rect x="6" y="7.5" width="9" height="2" rx="1" />
							<rect x="6" y="12" width="9" height="2" rx="1" />
						</svg>
						Нумерованный
					</span>
				</button>

				<span class="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />

				<button
					type="button"
					:class="btnClass()"
					:disabled="disabled"
					@click="run(() => editor?.chain().focus().setHardBreak().run())"
				>
					↵ Break
				</button>
				<button type="button" :class="btnClass(editor.isActive('link'))" :disabled="disabled" @click="setLink">
					Link
				</button>
				<button type="button" :class="btnClass()" :disabled="disabled || uploadingImage" @click="pickImage">
					{{ uploadingImage ? '...' : 'Image' }}
				</button>

				<span class="mx-1 h-5 w-px bg-gray-300" aria-hidden="true" />

				<button
					type="button"
					:class="btnClass()"
					:disabled="disabled || !editor.can().chain().focus().undo().run()"
					@click="run(() => editor?.chain().focus().undo().run())"
				>
					Undo
				</button>
			</div>

			<EditorContent :editor="editor" />
		</div>

		<input ref="imageInputRef" type="file" accept="image/*" class="hidden" @change="onImageSelected" />

		<p v-if="errorMessage" class="mt-1 text-xs text-red-500">{{ errorMessage }}</p>
	</div>
</template>

<style lang="scss" scoped>
	@import './rich-text-editor/editor.scss';
</style>
