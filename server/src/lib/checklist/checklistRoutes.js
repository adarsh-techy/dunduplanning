import { Router } from 'express';
import { protect } from '../../middleware/auth.js';
import { permit } from '../../middleware/permit.js';
import { upload } from '../../middleware/upload.js';

// Wires the standard set of routes for a checklist-style module, gated
// behind the given module permission (e.g. "planning", "marketing").
export const createChecklistRoutes = (controller, moduleName) => {
  const router = Router();

  router.use(protect, permit(moduleName));

  router.get('/', controller.getAll);
  router.post('/', controller.create);
  router.patch('/:id', controller.update);
  router.delete('/:id', controller.remove);
  router.post('/:id/attachments', upload.single('file'), controller.uploadAttachment);
  router.delete('/:id/attachments/:attachmentId', controller.deleteAttachment);

  return router;
};
