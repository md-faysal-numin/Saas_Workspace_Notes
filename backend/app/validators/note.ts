import vine from '@vinejs/vine'

export const noteValidator = vine.compile(
  vine.object({
    title: vine.string().maxLength(50),
    content: vine.string().maxLength(500),
    type: vine.enum(['public', 'private']),
    status: vine.enum(['draft', 'published']),
    tagIds: vine.array(vine.number()).optional(),
    workspaceId: vine.number(),
  })
)
