export interface IFormLogin {
	email: string
	password: string
}

export interface IAuthUser {
	id: number | null
	name: string
	email: string | null
}
