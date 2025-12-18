import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const registerValidator = vine.compile(
  vine.object({
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine
      .string()
      .minLength(6)
      .maxLength(32)
      .regex(/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{6,32}$/),
    fullName: vine.string().minLength(2).maxLength(20),
  })
)

registerValidator.messagesProvider = new SimpleMessagesProvider({
  'email.required': 'Email address is required',
  'email.email': 'Please provide a valid email address',
  'email.database.unique': 'This email is already registered',

  'password.required': 'Password is required',
  'password.minLength': 'Password must be at least 6 characters long',
  'password.maxLength': 'Password cannot exceed 32 characters',
  'password.regex':
    'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',

  'fullName.required': 'Full name is required',
  'fullName.minLength': 'Full name must be at least 2 characters',
  'fullName.maxLength': 'Full name cannot exceed 20 characters',
})
