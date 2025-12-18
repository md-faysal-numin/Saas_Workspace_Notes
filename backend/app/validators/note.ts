import vine, { SimpleMessagesProvider } from '@vinejs/vine'

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

noteValidator.messagesProvider = new SimpleMessagesProvider({
  'title.required': 'Title is required',
  'title.maxLength': 'Title must not exceed 50 characters',

  'content.required': 'Content is required',
  'content.maxLength': 'Content must not exceed 500 characters',

  'type.required': 'Note type is required',
  'type.enum': 'Note type must be either public or private',

  'status.required': 'Status is required',
  'status.enum': 'Status must be either draft or published',

  'tagIds.array': 'Tags must be an array of numbers',
  'tagIds.*.number': 'Each tag must be a valid number',

  'workspaceId.required': 'Workspace is required',
  'workspaceId.number': 'Workspace must be a valid ID',
})
