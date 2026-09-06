import * as marketingController from '../controllers/marketingController.js';
import { createChecklistRoutes } from '../lib/checklist/checklistRoutes.js';

export default createChecklistRoutes(marketingController, 'marketing');
