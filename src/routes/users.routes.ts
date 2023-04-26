import { Router } from "express";
import { check, param } from 'express-validator'

import { getUsers, getUser, postUser, putUser, deleteUser } from '../controllers/users.controllers'
import { validateFields } from "../middlewares/validateFields";
import { existingEmail, existingUserById } from '../helpers/dbValidators'

const router = Router()

router.get('/', getUsers)

router.get('/:id', getUser)

router.post('/', [
  check('firstName', 'El nombre es obligatorio').notEmpty(),
  check('lastName', 'El apellido es obligatorio').notEmpty(),
  check('email', 'El email es obligatorio').notEmpty(),
  check('email', 'El email no se encuentra en el formato correcto').isEmail(),
  check('email').custom( (email) => existingEmail(email) ),
  check('password', 'La contraseña es obligatoria').notEmpty(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  validateFields
], postUser)

router.put('/:id',[
  param('id', 'El id debe ser un numero').isNumeric(),
  param("id").custom( (id) => existingUserById(id) ),
  check('firstName', 'Se ha pasado un nombre vacio').optional().notEmpty(),
  check('lastName', 'Se ha pasado un apellido vacio').optional().notEmpty(),
  check('email', 'El email no se encuentra en el formato correcto').optional().isEmail(),
  check('email').custom( (email) => existingEmail(email) ),
  check('password', 'La contraseña debe tener al menos 6 caracteres').optional().isLength({ min: 6 }),
  validateFields
], putUser)

router.delete('/:id',[
  param('id', 'El id debe ser un numero').isNumeric(),
  param("id").custom( (id) => existingUserById(id) ),
  validateFields
], deleteUser)


export default router;
