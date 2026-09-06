import * as stepController from '../controllers/stepController.js';
import { createChecklistRoutes } from './checklistRoutesFactory.js';

export default createChecklistRoutes(stepController, 'planning');
