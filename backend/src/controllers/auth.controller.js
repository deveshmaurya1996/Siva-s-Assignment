import { signupBodySchema, loginBodySchema } from '../validators/auth.validator.js';
import * as authService from '../services/auth.service.js';

export async function signup(req, res, next) {
  try {
    const body = signupBodySchema.parse(req.body);
    const result = await authService.signup(body);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const body = loginBodySchema.parse(req.body);
    const result = await authService.login(body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json({ user });
  } catch (e) {
    next(e);
  }
}
