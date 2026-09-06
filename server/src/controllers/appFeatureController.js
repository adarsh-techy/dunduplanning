import AppFeature from '../models/AppFeature.js';
import { createChecklistController } from '../lib/checklist/checklistController.js';

export const { getAll, create, update, remove, uploadAttachment, deleteAttachment } =
  createChecklistController(AppFeature);
