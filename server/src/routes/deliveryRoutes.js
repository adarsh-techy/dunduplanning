import * as deliveryController from '../controllers/deliveryController.js';
import { createChecklistRoutes } from './checklistRoutesFactory.js';

export default createChecklistRoutes(deliveryController, 'delivery');
