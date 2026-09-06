import * as marketingController from '../controllers/marketingController.js';
import { createChecklistRoutes } from './checklistRoutesFactory.js';

export default createChecklistRoutes(marketingController, 'marketing');
