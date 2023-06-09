import { Request, Response } from "express";
import AppDataSource from '../database/config'
import bcrypt from 'bcryptjs'
import User from '../entities/User.entities'
import { generateJWT } from "../helpers/generateJWT";
import verifyTokenGoogle from "../helpers/verifyTokenGoogle";
import Role from "../entities/Role.entities";
import generatePassword from "../helpers/generatePassword";
import { sendEmail } from "../helpers/sendEmail";

export const Authenticate = async (req: Request, res: Response) => {

  const { email, password } = req.body

  try {

    AppDataSource.getRepository(User)

    const error = {
      ok: false,
      message: 'El correo o la contraseña estan incorrectas'
    }

    // verificamos el email y si es un usuario activo
    const user = await AppDataSource
      .getRepository(User)
      .findOne({
        relations: { role: true },
        where: { state: true, email: email }
      })

    // retornamos en caso de que no exista
    if (!user) return res.status(400).json(error)

    // verificamos la contraseña
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json(error)

    // enviamos solo los datos que queremos mostrar
    const dataUser = {
      id: user.id, // temporal
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.role,
    }

    // generamos JWT
    const token = await generateJWT(user.id, user.role.role);

    res.status(200).json({
      ok: true,
      message: 'Usuario autenticado correctamente',
      user: dataUser,
      token: token
    })

  } catch (error) {

    res.status(500).json({
      ok: false,
      message: "Error al intentar obtener el usuario",
      error: error
    })

  }
}

export const googleSignIn = async (req: Request, res: Response) => {

  const { id_token } = req.body

  try {

    const { firstName, lastName, email } = await verifyTokenGoogle(id_token)

    let user = await AppDataSource
      .getRepository(User)
      .findOne({
        relations: { role: true },
        where: { state: true, email: email }
      })

    if (!user) {
      // si el usuario no existe
      const newUser = new User()
      newUser.firstName = firstName
      newUser.lastName = lastName
      newUser.email = email
      newUser.password = ':p'
      newUser.google = true
      newUser.role = { id: 1 } as Role;
      user = await AppDataSource.manager.save(newUser)
    }

    const token = await generateJWT(user.id, user.role.role);

    // enviamos solo los datos que queremos mostrar
    const dataUser = {
      id: user.id, // temporal
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role.role,
    }

    res.json({
      ok: true,
      message: 'Todo ok, google signIn',
      user: dataUser,
      token: token
    })

  } catch (error) {
    res.status(400).json({
      ok: false,
      message: "Error verificar la cuenta de Google",
      error: error
    })
  }

}

export const sendNewPassword = async (req: Request, res: Response) => {

  const { email } = req.body

  const error = {
    ok: false,
    message: 'Ha ocurrido un error al intentar enviar el correo'
  }

  try {

    const user = await AppDataSource
      .getRepository(User)
      .findOne({
        relations: { role: true },
        where: { state: true, email: email, google: false }
      })

    if (!user) {
      return res.status(400).json(error)
    }

    let newPassword = generatePassword()

    const ok = await sendEmail(email, user.firstName, newPassword)

    if(!ok){
      return res.status(400).json(error)
    }

    newPassword = bcrypt.hashSync(newPassword, bcrypt.genSaltSync(10))
    const userPasswordUpdated = AppDataSource.getRepository(User)
    await userPasswordUpdated.update(user.id, { password: newPassword })

    return res.status(400).json({
      ok: true,
      message: 'Se ha enviado un correo con tu nueva contraseña'
    })

  } catch (error) {
    res.status(500).json({
      ok: false,
      message: 'Ha ocurrido un error al intentar enviar el correo - Error al intentar obtener el usuario',
      error: error
    })
  }

}
