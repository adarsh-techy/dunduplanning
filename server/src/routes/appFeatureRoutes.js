import * as appFeatureController from '../controllers/appFeatureController.js';
import { createChecklistRoutes } from '../lib/checklist/checklistRoutes.js';

export default createChecklistRoutes(appFeatureController, 'app');
