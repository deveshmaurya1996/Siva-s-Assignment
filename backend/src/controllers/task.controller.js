import {
  taskCreateSchema,
  taskUpdateSchema,
  taskListQuerySchema,
  idParamSchema,
} from '../validators/task.validator.js';
import * as taskService from '../services/task.service.js';

export async function list(req, res, next) {
  try {
    const query = taskListQuerySchema.parse(req.query);
    const result = await taskService.listTasks(req.user, query);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

export async function getOne(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const task = await taskService.getTaskById(id, req.user);
    res.json({ task });
  } catch (e) {
    next(e);
  }
}

export async function create(req, res, next) {
  try {
    const body = taskCreateSchema.parse(req.body);
    const task = await taskService.createTask(body, req.user);
    res.status(201).json({ task });
  } catch (e) {
    next(e);
  }
}

export async function update(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    const body = taskUpdateSchema.parse(req.body);
    const task = await taskService.updateTask(id, body, req.user);
    res.json({ task });
  } catch (e) {
    next(e);
  }
}

export async function remove(req, res, next) {
  try {
    const { id } = idParamSchema.parse(req.params);
    await taskService.deleteTask(id, req.user);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
