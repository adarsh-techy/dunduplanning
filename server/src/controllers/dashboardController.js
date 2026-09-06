import Step from '../models/Step.js';
import Marketing from '../models/Marketing.js';
import Feature from '../models/Feature.js';
import Delivery from '../models/Delivery.js';
import AppFeature from '../models/AppFeature.js';
import Packing from '../models/Packing.js';
import Purchase from '../models/Purchase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const CHECKLIST_MODELS = {
  planning: Step,
  marketing: Marketing,
  features: Feature,
  delivery: Delivery,
  app: AppFeature,
  packing: Packing,
};

const summarizeChecklist = async (Model) => {
  const items = await Model.find();
  const total = items.length;
  const complete = items.filter((i) => i.status === 'complete').length;
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const pending = items.filter((i) => i.status === 'pending').length;
  const estimatedCost = items.reduce((sum, i) => sum + (i.estimatedCost || 0), 0);
  const actualCost = items.reduce((sum, i) => sum + (i.actualCost || 0), 0);

  return {
    total,
    complete,
    inProgress,
    pending,
    percentComplete: total ? Math.round((complete / total) * 100) : 0,
    estimatedCost,
    actualCost,
  };
};

export const getSummary = asyncHandler(async (req, res) => {
  const canSee = (moduleName) =>
    req.user.role === 'superadmin' || req.user.permissions?.[moduleName];

  const summary = {};
  let checklistActualCostTotal = 0;

  for (const [moduleName, Model] of Object.entries(CHECKLIST_MODELS)) {
    if (canSee(moduleName)) {
      const moduleSummary = await summarizeChecklist(Model);
      summary[moduleName] = moduleSummary;
      checklistActualCostTotal += moduleSummary.actualCost;
    }
  }

  if (canSee('purchase')) {
    const purchases = await Purchase.find();
    const totalCost = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    summary.purchase = {
      total: purchases.length,
      received: purchases.filter((p) => p.status === 'received').length,
      ordered: purchases.filter((p) => p.status === 'ordered').length,
      planned: purchases.filter((p) => p.status === 'planned').length,
      totalCost,
    };
  }

  summary.grandTotalCost = checklistActualCostTotal + (summary.purchase?.totalCost || 0);

  res.json({ summary });
});
