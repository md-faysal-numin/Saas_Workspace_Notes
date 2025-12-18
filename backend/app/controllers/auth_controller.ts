import type { HttpContext } from '@adonisjs/core/http'
import { registerValidator } from '#validators/register'
import { inject } from '@adonisjs/core'
import { AuthService } from '#services/auth_service'

@inject()
export default class AuthController {
  constructor(protected authService: AuthService) {}

  async register({ request, response }: HttpContext) {
    const data = await request.validateUsing(registerValidator)
    const domain = request.hostname()!
    try {
      const { user, token } = await this.authService.registerUser(domain, data)
      response.cookie('token', token.value!.release())
      return response.created({ user })
    } catch (error) {
      if (error.message === 'Invalid domain') {
        return response.status(400).json({ message: 'Invalid domain' })
      } else {
        return response.status(500).json({ message: 'Failed to create user. Please try again.' })
      }
    }
  }

  async login({ request, response }: HttpContext) {
    const { email, password } = request.only(['email', 'password'])
    const { user, token } = await this.authService.loginUser(email, password)
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
    try {
      const user = auth.user!
      await this.authService.logoutUser(user)
      response.clearCookie('token')

      return response.ok({ message: 'Logged out successfully' })
    } catch (error) {
      return response.status(500).json({ message: 'Failed to logout. Please try again.' })
    }
  }

  async me({ auth, response }: HttpContext) {
    const user = auth.user!
    return response.ok({
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      },
    })
  }
}
