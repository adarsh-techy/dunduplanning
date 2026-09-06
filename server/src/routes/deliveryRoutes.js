import * as deliveryController from '../controllers/deliveryController.js';
import { createChecklistRoutes } from '../lib/checklist/checklistRoutes.js';

export default createChecklistRoutes(deliveryController, 'delivery');
