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
  const items = await Model.find().select('status estimatedCost actualCost').lean();
  const total = items.length;
  let complete = 0;
  let inProgress = 0;
  let pending = 0;
  let estimatedCost = 0;
  let actualCost = 0;

  for (let i = 0; i < total; i++) {
    const it = items[i];
    if (it.status === 'complete') complete++;
    else if (it.status === 'in_progress') inProgress++;
    else if (it.status === 'pending') pending++;
    estimatedCost += it.estimatedCost || 0;
    actualCost += it.actualCost || 0;
  }

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

const summarizeByStatus = (items) => {
  const total = items.length;
  let complete = 0;
  let inProgress = 0;
  let pending = 0;

  for (let i = 0; i < total; i++) {
    const it = items[i];
    if (it.status === 'complete') complete++;
    else if (it.status === 'in_progress') inProgress++;
    else if (it.status === 'pending') pending++;
  }

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
    req.user.role === 'superadmin' || Boolean(req.user.permissions?.[moduleName]);

  const summary = {};
  let grandCostTotal = 0;

  const tasks = [];

  // Execute all checklist module summaries in parallel
  for (const [moduleName, Model] of Object.entries(CHECKLIST_MODELS)) {
    if (canSee(moduleName)) {
      tasks.push(
        summarizeChecklist(Model).then((res) => {
          summary[moduleName] = res;
          grandCostTotal += res.actualCost;
        })
      );
    }
  }

  if (canSee('packing')) {
    tasks.push(
      Packing.find().select('status cost').lean().then((packingItems) => {
        const totalCost = packingItems.reduce((sum, i) => sum + (i.cost || 0), 0);
        summary.packing = { ...summarizeByStatus(packingItems), totalCost };
        grandCostTotal += totalCost;
      })
    );
  }

  if (canSee('deployment')) {
    tasks.push(
      Deployment.find().select('status cost').lean().then((deploymentItems) => {
        const totalCost = deploymentItems
          .filter((i) => i.status === 'complete')
          .reduce((sum, i) => sum + (i.cost || 0), 0);
        summary.deployment = { ...summarizeByStatus(deploymentItems), totalCost };
        grandCostTotal += totalCost;
      })
    );
  }

  if (canSee('purchase')) {
    tasks.push(
      Purchase.find().select('totalCost items').lean().then((purchases) => {
        const totalCost = purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0);
        const totalItems = purchases.reduce((sum, p) => sum + (p.items?.length || 0), 0);
        summary.purchase = {
          total: purchases.length,
          totalItems,
          totalCost,
        };
      })
    );
  }

  await Promise.all(tasks);

  summary.grandTotalCost = grandCostTotal;

  res.json({ summary });
});
