// import Company from '#models/company'
// import { companyValidator } from '#validators/company'
// import type { HttpContext } from '@adonisjs/core/http'

// export default class CompanyController {
//   async register({ request, response }: HttpContext) {
//     console.log('hi')
//     const data = await request.validateUsing(companyValidator)
//     const company = await Company.create(data)
//     return response.created({ company })
//   }
// }

// app/controllers/company_controller.ts
import { HttpContext } from '@adonisjs/core/http'
import Company from '#models/company'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'
import { companyValidator } from '#validators/company'
// import hash from '@adonisjs/core/services/hash'

export default class CompanyController {
  /**
   * Register company with admin user (transactional)
   */
  async register({ request, response }: HttpContext) {
    // Validate input
    // console.log(request.all())
    const data = await request.validateUsing(companyValidator)
    // console.log('passed')
    // Start database transaction
    const trx = await db.transaction()

    try {
      // 3. Create company
      const company = new Company()
      company.name = data.companyName
      company.slug = data.companySlug
      company.useTransaction(trx)
      await company.save()

      // 4. Create admin user
      const user = new User()
      user.companyId = company.id
      user.fullName = data.fullName
      user.email = data.email
      user.password = data.password
      user.role = 'admin' // Make first user admin
      user.useTransaction(trx)
      await user.save()

      await trx.commit()
      // 5. Create access token
      const token = await User.accessTokens.create(user)

      // Commit transaction

      // Set cookie
      response.cookie('token', token.value!.release())

      return response.created({
        message: 'Company and admin user created successfully',
        company: {
          name: company.name,
          slug: company.slug,
        },
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
        },
      })
    } catch (error) {
      // Rollback transaction on any error
      await trx.rollback()
      console.error('Company registration error:', error)

      return response.status(500).json({
        message: 'Failed to create company and user. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }
}
