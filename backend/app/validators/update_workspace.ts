import vine from '@vinejs/vine'

export const updateWorkspaceValidator = vine.compile(
  vine.object({
    name: vine.string().maxLength(255),
    slug: vine.string()
      .maxLength(255)
      .unique(async (db, value, field) => {
        const workspaceId = field.meta.workspaceId
        const companyId = field.meta.companyId

        const record = await db
          .from('workspaces')
          .where('company_id', companyId)
          .where('slug', value)
          .whereNot('id', workspaceId)
          .first()

        return !record
      }),
    description: vine.string().maxLength(255),
  })
)