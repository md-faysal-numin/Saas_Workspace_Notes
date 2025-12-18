import Company from '#models/company'
import Note from '#models/note'
import Workspace from '#models/workspace'
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'

export default class extends BaseSeeder {
  async run() {
    // Fetch existing companies with users
    const companies = await Company.query().preload('users',(q)=> q.where('role', 'admin'))

    for (const company of companies) {
      if (company.users.length === 0) continue

      const creator = company.users[0] // use first user as creator

      // Create 5 workspaces per company
      for (let w = 6; w <= 11; w++) {
        const workspace = await Workspace.create({
          companyId: company.id,
          name: `Workspace ${w} - ${company.name}`,
          slug: `workspace-${w}-${company.slug}`,
        })

        // Create 50 notes per workspace
        for (let n = 51; n <= 120; n++) {
          const status = Math.random() > 0.5 ? 'published' : 'draft'
          const type = Math.random() > 0.5 ? 'public' : 'private'

          await Note.create({
            workspaceId: workspace.id,
            createdBy: creator.id,
            title: `Note ${n} (${workspace.name})`,
            content: `Seeded content for note ${n}`,
            type,
            status,
            publishedAt: status === 'published' ? DateTime.now() : null,
          })
        }
      }
    }
  }
}
