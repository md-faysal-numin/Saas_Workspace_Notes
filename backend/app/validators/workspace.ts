import vine from '@vinejs/vine'

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
