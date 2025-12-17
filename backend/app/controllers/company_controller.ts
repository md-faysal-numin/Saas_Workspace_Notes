import { HttpContext } from '@adonisjs/core/http'

import { companyValidator } from '#validators/company'
import { inject } from '@adonisjs/core'
import { CompanyService } from '#services/company_service'

@inject()
export default class CompanyController {
  constructor(protected companyService: CompanyService) {}
  async register({ request, response }: HttpContext) {
    // Validate input
    // console.log(request.all())
    const data = await request.validateUsing(companyValidator)
    // console.log('passed')
    // Start database transaction

    try {
      const { company, user, token } = await this.companyService.registerCompany(data)

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

      return response.status(500).json({
        message: 'Failed to create company and user. Please try again.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      })
    }
  }
}
