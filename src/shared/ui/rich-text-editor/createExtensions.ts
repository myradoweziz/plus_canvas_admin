import { Details, DetailsContent, DetailsSummary } from '@tiptap/extension-details'
import { Color } from '@tiptap/extension-color'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle } from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'

export type CreateRichTextExtensionsOptions = {
	placeholder?: string
}

export const createRichTextExtensions = (options: CreateRichTextExtensionsOptions = {}) => [
	StarterKit.configure({
		link: false,
		underline: false
	}),
	Underline,
	Link.configure({
		openOnClick: false,
		autolink: true,
		defaultProtocol: 'https',
		HTMLAttributes: {
			class: 'text-blue-600 underline'
		}
	}),
	TextStyle,
	Color.configure({
		types: ['textStyle']
	}),
	FontFamily.configure({
		types: ['textStyle']
	}),
	Highlight.configure({
		multicolor: false
	}),
	Subscript,
	Superscript,
	TextAlign.configure({
		types: ['heading', 'paragraph']
	}),
	Image.configure({
		inline: false,
		allowBase64: false,
		HTMLAttributes: {
			class: 'max-w-full rounded-lg'
		}
	}),
	TaskList,
	TaskItem.configure({
		nested: true
	}),
	Details.configure({
		persist: true,
		openClassName: 'is-open'
	}),
	DetailsSummary,
	DetailsContent,
	Placeholder.configure({
		placeholder: options.placeholder ?? 'Введите текст...'
	})
]
