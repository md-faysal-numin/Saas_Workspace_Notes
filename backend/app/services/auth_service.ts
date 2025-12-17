import User from '#models/user'
import Company from '#models/company'
import { AccessToken } from '@adonisjs/auth/access_tokens'
export class AuthService {
  private createToken(user: User) {
    return User.accessTokens.create(user)
  }

  private deleteToken(
    user: User & {
      currentAccessToken: AccessToken
    }
  ) {
    return User.accessTokens.delete(user, user.currentAccessToken.identifier)
  }
  async registerUser(domain: string, data: any) {
    const company = await Company.findBy('slug', domain)
    if (!company) {
      throw new Error('Invalid domain')
    }
    // console.log(company)
    const companyId = company.id
    // console.log(data, companyId, domain)
    const user = await User.create({
      ...data,
      companyId,
    })
    const token = await this.createToken(user)
    return {
      user: {
        id: user.id,
        fullName: user.fullName,
        role: user.role,
      },
      token,
    }
  }
  async loginUser(email: string, password: string) {
    const user = await User.verifyCredentials(email, password)
    const token = await this.createToken(user)
    return { user, token }
  }

  async logoutUser(
    user: User & {
      currentAccessToken: AccessToken
    }
  ) {
    await this.deleteToken(user)
  }
}
