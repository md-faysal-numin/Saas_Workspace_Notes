/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from './kernel.js'
import AuthController from '#controllers/auth_controller'
import TagsController from '#controllers/tags_controller'
import WorkspacesController from '#controllers/workspaces_controller'
import NotesController from '#controllers/notes_controller'
import CompanyController from '#controllers/company_controller'

router.post('/company/register', [CompanyController, 'register'])

// Public routes
router.post('/auth/register', [AuthController, 'register'])
router.post('/auth/login', [AuthController, 'login'])

// Tags (public for autocomplete)
router.get('/tags', [TagsController, 'index'])

// Protected routes
router
  .group(() => {
    // Auth
    router.post('/auth/logout', [AuthController, 'logout'])
    router.get('/auth/me', [AuthController, 'me'])

    // Workspaces
    router
      .group(() => {
        router.get('/', [WorkspacesController, 'index'])
        router.post('/', [WorkspacesController, 'store']).use(middleware.admin())
        router.get('/:id', [WorkspacesController, 'show'])
        router.put('/:id', [WorkspacesController, 'update']).use(middleware.admin())
        router.delete('/:id', [WorkspacesController, 'destroy']).use(middleware.admin())
      })
      .prefix('/workspaces')

    router
      .group(() => {
        // Public notes (from my company)
        router.get('/public', [NotesController, 'publicNotes'])

        // Private notes (my notes)
        router.get('/private', [NotesController, 'privateNotes'])

        // Note CRUD
        router.post('/', [NotesController, 'store'])
        router.get('/:id', [NotesController, 'show'])
        router.put('/:id', [NotesController, 'update'])
        router.delete('/:id', [NotesController, 'destroy'])

        // Note histories
        router.get('/:id/histories', [NotesController, 'histories'])
        router.post('/:id/restore', [NotesController, 'restore'])

        // Note voting
        router.post('/:id/vote', [NotesController, 'vote'])
      })
      .prefix('/notes')

    // Tags
    router.post('/tags', [TagsController, 'store'])
  })
  .middleware([middleware.auth()])
