import User from '../entities/User.entities'
import Role from '../entities/Role.entities'
import AppDataSource from '../database/config'

export const existingEmail = async(email = '') => {

  const UserRepository = AppDataSource.getRepository(User)

  const existingEmail = await UserRepository.findOneBy({
    email: email,
  })

  if(existingEmail){
    throw new Error(`El ${email} ya se encuentra en uso`)
  }

}

export const existingUserById = async( id : number ) => {

  const UserRepository = AppDataSource.getRepository(User)

  const userExists = await UserRepository.findOneBy({
    id: id,
    state: true,
  })

  if(!userExists){
    throw new Error(`EL usuario con id ${id} no existe`)
  }

}



export const existingRole = async( idRole: number ) => {

  const RoleRepository = AppDataSource.getRepository(Role)

  const rolExists = await RoleRepository.findOneBy({ id: idRole })

  if(!rolExists){
    throw new Error(`el rolID ingresado no está registrado en la base de datos`)
  }

}