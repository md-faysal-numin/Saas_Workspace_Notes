import vine, { SimpleMessagesProvider } from '@vinejs/vine'

export const workspaceValidator = (companyId: number) =>
  vine.compile(
    vine.object({
      name: vine.string().maxLength(255),
      slug: vine
        .string()
        .maxLength(255)
        .unique(async (db, value) => {
          const res = await db
            .from('workspaces')
            .where('company_id', companyId)
            .where('slug', value)
          return res.length === 0 // return true if unique
        }),
      description: vine.string().maxLength(255).optional(),
    })
  )

workspaceValidator.messagesProvider = new SimpleMessagesProvider({
  'name.required': 'Workspace name is required',
  'name.maxLength': 'Workspace name must not exceed 255 characters',

  'slug.required': 'Workspace slug is required',
  'slug.maxLength': 'Workspace slug must not exceed 255 characters',
  'slug.database.unique': 'This workspace slug already exists in your company',

  'description.maxLength': 'Description must not exceed 255 characters',
})
