export type EmailAccount = {
	id: number | null
	email: string
	display_name: string
	host: string
	port: number
	username: string
	password: string
	ssl: boolean
	use_default_credentials: boolean
	is_default: boolean
}

export type EmailAccountPayload = Omit<EmailAccount, 'id'>

