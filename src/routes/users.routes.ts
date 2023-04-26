import { Router } from "express";
import { check } from 'express-validator'

import { getUsers, getUser, postUser } from '../controllers/users.controllers'
import { validateFields } from "../middlewares/validateFields";

const router = Router()

router.get('/', getUsers)
router.get('/:id', getUser)
router.post('/', [
  check('firstName', 'El nombre es obligatorio').notEmpty(),
  check('lastName', 'El apellido es obligatorio').notEmpty(),
  check('email', 'El email es obligatorio').notEmpty(),
  check('email', 'El email no se encuentra en el formato correcto').isEmail(),
  check('password', 'La contraseña es obligatoria').notEmpty(),
  check('password', 'La contraseña debe tener al menos 6 caracteres').isLength({ min: 6 }),
  validateFields
], postUser)

export default router;
