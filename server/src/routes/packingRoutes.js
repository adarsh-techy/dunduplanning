import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { permit } from '../middleware/permit.js';
import { upload } from '../middleware/upload.js';
import * as packingController from '../controllers/packingController.js';

const router = Router();

router.use(protect, permit('packing'));

router.get('/', packingController.getAll);
router.post('/', packingController.create);
router.patch('/:id', packingController.update);
router.delete('/:id', packingController.remove);
router.post('/:id/attachments', upload.single('file'), packingController.uploadAttachment);
router.delete('/:id/attachments/:attachmentId', packingController.deleteAttachment);

export default router;
