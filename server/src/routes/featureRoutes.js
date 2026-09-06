import * as featureController from '../controllers/featureController.js';
import { createChecklistRoutes } from '../lib/checklist/checklistRoutes.js';

export default createChecklistRoutes(featureController, 'features');
