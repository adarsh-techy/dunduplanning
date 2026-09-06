import Feature from '../models/Feature.js';
import { createChecklistController } from './checklistControllerFactory.js';

export const { getAll, create, update, remove, uploadAttachment, deleteAttachment } =
  createChecklistController(Feature);
