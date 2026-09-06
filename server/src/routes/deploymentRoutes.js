import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { permit } from '../middleware/permit.js';
import { upload } from '../middleware/upload.js';
import * as deploymentController from '../controllers/deploymentController.js';

const router = Router();

router.use(protect, permit('deployment'));

router.get('/', deploymentController.getAll);
router.post('/', deploymentController.create);
router.patch('/:id', deploymentController.update);
router.delete('/:id', deploymentController.remove);
router.post('/:id/attachments', upload.single('file'), deploymentController.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', deploymentController.deleteAttachment);

export default router;
