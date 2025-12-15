import vine from '@vinejs/vine'

export const companyValidator = vine.compile(
  vine.object({
    companyName: vine.string().minLength(3).maxLength(255).unique({ table: 'companies', column: 'name' }),
    companySlug: vine.string().minLength(3).maxLength(255).unique({ table: 'companies', column: 'slug' }),

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
