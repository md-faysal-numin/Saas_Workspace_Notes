import type { HttpContext } from '@adonisjs/core/http'

import User from '#models/user'
import Company from '#models/company'
import { registerValidator } from '#validators/register'

export default class AuthController {
  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const domain = request.hostname()
    const company = await Company.findBy('slug', domain)
    if (!company) {
      return response.status(400).json({ message: 'Invalid domain' })
    }
    // console.log(company)
    const companyId = company.id
    // console.log(data, companyId, domain)
    const user = await User.create({
      ...data,
      companyId,
    })
    const token = await User.accessTokens.create(user)
    response.cookie('token', token.value!.release())

    return response.created({ user, token })
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const user = await User.verifyCredentials(email, password)
    const token = await User.accessTokens.create(user)
    response.cookie('token', token.value!.release())

    return response.ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      },
    })
  }

  async logout({ auth, response }: HttpContext) {
    const user = auth.user!
    await User.accessTokens.delete(user, user.currentAccessToken.identifier)
    response.clearCookie('token')

    return response.ok({ message: 'Logged out successfully' })
  }

  async me({ auth }: HttpContext) {
    await auth.user!
    return {
      user: {
        id: auth.user!.id,
        fullName: auth.user!.fullName,
        role: auth.user!.role,
      },
    }
  }
}
