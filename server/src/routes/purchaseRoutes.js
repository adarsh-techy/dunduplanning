import { Router } from 'express';
import {
  getPurchases,
  createPurchase,
  updatePurchase,
  deletePurchase,
  uploadPurchaseAttachment,
  deletePurchaseAttachment,
} from '../controllers/purchaseController.js';
import { protect } from '../middleware/auth.js';
import { permit } from '../middleware/permit.js';
import { upload } from '../middleware/upload.js';

const router = Router();

router.use(protect, permit('purchase'));

router.get('/', getPurchases);
router.post('/', createPurchase);
router.patch('/:id', updatePurchase);
router.delete('/:id', deletePurchase);
router.post('/:id/attachments', upload.single('file'), uploadPurchaseAttachment);
router.delete('/:id/attachments/:attachmentId', deletePurchaseAttachment);

export default router;
