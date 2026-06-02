import { request } from '@/shared'
import { createListApi } from '@/shared/api/createListApi'
import type { EmailAccount, EmailAccountPayload } from '../types'

const EMAIL_ACCOUNTS_URL = '/api/admin/email-accounts'

export type ListEmailAccountsParams = {
	limit: number
	offset: number
}

const listEmailAccounts = createListApi<EmailAccount, ListEmailAccountsParams>({ url: EMAIL_ACCOUNTS_URL })

async function listAllEmailAccounts(): Promise<EmailAccount[]> {
	const response = await request({ url: EMAIL_ACCOUNTS_URL, method: 'GET' })
	return Array.isArray(response) ? response : response?.data || response?.items || []
}

function toPayload(account: EmailAccount): EmailAccountPayload {
	return {
		email: account.email,
		display_name: account.display_name,
		host: account.host,
		port: Number(account.port) || 0,
		username: account.username,
		password: account.password,
		ssl: !!account.ssl,
		use_default_credentials: !!account.use_default_credentials,
		is_default: !!account.is_default
	}
}

async function getEmailAccountById(id: number): Promise<EmailAccount> {
	return await request({ url: `${EMAIL_ACCOUNTS_URL}/${id}`, method: 'GET' })
}

async function createEmailAccount(account: EmailAccount): Promise<EmailAccount> {
	return await request({ url: EMAIL_ACCOUNTS_URL, method: 'POST', data: toPayload(account) })
}

async function updateEmailAccount(account: EmailAccount): Promise<EmailAccount> {
	return await request({ url: `${EMAIL_ACCOUNTS_URL}/${account.id}`, method: 'PUT', data: toPayload(account) })
}

async function deleteEmailAccount(id: number): Promise<void> {
	await request({ url: `${EMAIL_ACCOUNTS_URL}/${id}`, method: 'DELETE' })
}

async function testEmailAccount(id: number, test_email: string): Promise<void> {
	await request({ url: `${EMAIL_ACCOUNTS_URL}/${id}/test-email`, method: 'POST', data: { test_email } })
}

export const emailAccountsApi = {
	listEmailAccounts,
	listAllEmailAccounts,
	getEmailAccountById,
	createEmailAccount,
	updateEmailAccount,
	deleteEmailAccount,
	testEmailAccount
}

