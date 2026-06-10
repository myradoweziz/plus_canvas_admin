const turkishMap: Record<string, string> = {
	ç: 'c',
	ğ: 'g',
	ı: 'i',
	ö: 'o',
	ş: 's',
	ü: 'u',
	â: 'a',
	î: 'i',
	û: 'u'
}

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

const transliterateChar = (char: string) => turkishMap[char] ?? cyrillicMap[char] ?? char

export const isValidSlugFormat = (value: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())

export const looksLikeUnslugifiedSlug = (slug: string, source: string) => {
	const normalizedSlug = slug.trim()
	const normalizedSource = source.trim()

	if (!normalizedSlug) return true
	if (normalizedSlug === normalizedSource) return true

	return !isValidSlugFormat(normalizedSlug)
}

export const slugify = (value: string) => {
	return value
		.toLocaleLowerCase('tr-TR')
		.split('')
		.map((char) => transliterateChar(char))
		.join('')
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
}

