import * as featureController from '../controllers/featureController.js';
import { createChecklistRoutes } from './checklistRoutesFactory.js';

export default createChecklistRoutes(featureController, 'features');
