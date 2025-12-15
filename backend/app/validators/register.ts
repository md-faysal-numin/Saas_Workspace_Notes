import vine from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine.string().minLength(6).maxLength(32).regex(/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{6,32}$/),
    fullName: vine.string().minLength(2).maxLength(20),
  })
)
