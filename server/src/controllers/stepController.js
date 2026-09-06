import Step from '../models/Step.js';
import { createChecklistController } from './checklistControllerFactory.js';

export const { getAll, create, update, remove, uploadAttachment, deleteAttachment } =
  createChecklistController(Step);
