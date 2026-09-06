import Packing from '../models/Packing.js';
import { createChecklistController } from './checklistControllerFactory.js';

export const { getAll, create, update, remove, uploadAttachment, deleteAttachment } =
  createChecklistController(Packing);
