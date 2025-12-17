import Company from '#models/company'
import User from '#models/user'
import db from '@adonisjs/lucid/services/db'

export class CompanyService {
  // Your code here

  async registerCompany(data: any) {
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

      return { company, user, token }
    } catch (error) {
      await trx.rollback()
      throw new Error('Company registration error')
    }
  }
}
