import Marketing from '../models/Marketing.js';
import { createChecklistController } from './checklistControllerFactory.js';

export const { getAll, create, update, remove, uploadAttachment, deleteAttachment } =
  createChecklistController(Marketing);
