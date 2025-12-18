import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const companyValidator = vine.compile(
  vine.object({
    companyName: vine
      .string()
      .minLength(3)
      .maxLength(255)
      .unique({ table: 'companies', column: 'name' }),
    companySlug: vine
      .string()
      .minLength(3)
      .maxLength(255)
      .unique({ table: 'companies', column: 'slug' }),

    //Admin user
    email: vine.string().email().unique({ table: 'users', column: 'email' }),
    password: vine
      .string()
      .minLength(6)
      .maxLength(32)
      .regex(/^(?=.*?[0-9])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[^0-9A-Za-z]).{6,32}$/),
    fullName: vine.string().minLength(2).maxLength(20),
  })
)

companyValidator.messagesProvider = new SimpleMessagesProvider({
  // Company
  'companyName.required': 'Company name is required',
  'companyName.minLength': 'Company name must be at least 3 characters',
  'companyName.maxLength': 'Company name must not exceed 255 characters',
  'companyName.database.unique': 'Company name already exists',

  'companySlug.required': 'Company slug is required',
  'companySlug.minLength': 'Company slug must be at least 3 characters',
  'companySlug.maxLength': 'Company slug must not exceed 255 characters',
  'companySlug.database.unique': 'Company slug already exists',

  // Admin user
  'email.required': 'Email is required',
  'email.email': 'Enter a valid email address',
  'email.unique': 'Email is already in use',

  'password.required': 'Password is required',
  'password.minLength': 'Password must be at least 6 characters',
  'password.maxLength': 'Password must not exceed 32 characters',
  'password.regex': 'Password must contain uppercase, lowercase, number, and special character',

  'fullName.required': 'Full name is required',
  'fullName.minLength': 'Full name must be at least 2 characters',
  'fullName.maxLength': 'Full name must not exceed 20 characters',
})
