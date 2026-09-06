import * as packingController from '../controllers/packingController.js';
import { createChecklistRoutes } from './checklistRoutesFactory.js';

export default createChecklistRoutes(packingController, 'packing');
