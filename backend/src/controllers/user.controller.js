import * as userService from '../services/user.service.js';

export async function list(req, res, next) {
  try {
    const users = await userService.listUsersForPicker();
    res.json({ users });
  } catch (e) {
    next(e);
  }
}
