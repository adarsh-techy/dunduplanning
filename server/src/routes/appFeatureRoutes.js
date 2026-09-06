import * as appFeatureController from '../controllers/appFeatureController.js';
import { createChecklistRoutes } from './checklistRoutesFactory.js';

export default createChecklistRoutes(appFeatureController, 'app');
