import Step from '../models/Step.js';
import Marketing from '../models/Marketing.js';
import Feature from '../models/Feature.js';
import Delivery from '../models/Delivery.js';
import AppFeature from '../models/AppFeature.js';
import Deployment from '../models/Deployment.js';
import Packing from '../models/Packing.js';
import Purchase from '../models/Purchase.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// These all share the generic checklist shape (status/estimatedCost/actualCost).
// Purchase, Packing and Deployment are bespoke shapes and get their own
// summary blocks below.
const CHECKLIST_MODELS = {
  planning: Step,
  marketing: Marketing,
  features: Feature,
  delivery: Delivery,
  app: AppFeature,
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

// Status breakdown only -- shared by Packing, which tracks pending/in
// progress/complete like the checklist modules but has its own cost field
// (a plain `cost`, no estimated/actual split).
const summarizeByStatus = (items) => {
  const total = items.length;
  const complete = items.filter((i) => i.status === 'complete').length;
  const inProgress = items.filter((i) => i.status === 'in_progress').length;
  const pending = items.filter((i) => i.status === 'pending').length;
  return {
    total,
    complete,
    inProgress,
    pending,
    percentComplete: total ? Math.round((complete / total) * 100) : 0,
  };
};

export const getSummary = asyncHandler(async (req, res) => {
  const canSee = (moduleName) =>
    req.user.role === 'superadmin' || req.user.permissions?.[moduleName];

  const summary = {};
  let grandCostTotal = 0;

  for (const [moduleName, Model] of Object.entries(CHECKLIST_MODELS)) {
    if (canSee(moduleName)) {
      const moduleSummary = await summarizeChecklist(Model);
      summary[moduleName] = moduleSummary;
      grandCostTotal += moduleSummary.actualCost;
    }
  }

  if (canSee('packing')) {
    const packingItems = await Packing.find();
    const totalCost = packingItems.reduce((sum, i) => sum + (i.cost || 0), 0);
    summary.packing = { ...summarizeByStatus(packingItems), totalCost };
    grandCostTotal += totalCost;
  }

  if (canSee('deployment')) {
    const deploymentItems = await Deployment.find();
    // Only a completed (ticked) service is actually being paid for -- a
    // pending one hasn't cost anything yet, so it shouldn't inflate either
    // Deployment's own total or the Grand Total Cost above.
    const totalCost = deploymentItems
      .filter((i) => i.status === 'complete')
      .reduce((sum, i) => sum + (i.cost || 0), 0);
    summary.deployment = { ...summarizeByStatus(deploymentItems), totalCost };
    grandCostTotal += totalCost;
  }

  if (canSee('purchase')) {
    const purchases = await Purchase.find();
    const totalCost = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
    const totalItems = purchases.reduce((sum, p) => sum + (p.items?.length || 0), 0);
    summary.purchase = {
      total: purchases.length,
      totalItems,
      totalCost,
    };
    // Deliberately NOT added to grandCostTotal -- the Planning Dashboard's
    // Grand Total Cost tracks setup/ops spend only. Purchase spend has its
    // own totals on Purchase Dashboard and Finance.
  }

  summary.grandTotalCost = grandCostTotal;

  res.json({ summary });
});
