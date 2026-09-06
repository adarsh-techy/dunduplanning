import * as stepController from '../controllers/stepController.js';
import { createChecklistRoutes } from '../lib/checklist/checklistRoutes.js';

export default createChecklistRoutes(stepController, 'planning');
