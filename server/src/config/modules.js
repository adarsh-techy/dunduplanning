// Single source of truth for the app's permission-gated modules. Admins get
// granted access per module here; Super Admins always have all of them.
export const MODULES = [
  { key: 'planning', label: 'Planning', icon: '📋' },
  { key: 'app', label: 'App Progress', icon: '📱' },
  { key: 'deployment', label: 'Deployment', icon: '🚀' },
  { key: 'features', label: 'Features', icon: '✨' },
  { key: 'purchase', label: 'Purchase', icon: '🛒' },
  { key: 'packing', label: 'Packing', icon: '📦' },
  { key: 'delivery', label: 'Delivery', icon: '🚚' },
  { key: 'marketing', label: 'Marketing', icon: '📣' },
];

export const MODULE_KEYS = MODULES.map((m) => m.key);

// planning/app/features/delivery/marketing all share the exact same
// checklist shape (title/status/cost/dueDate/notes/attachments); purchase,
// packing and deployment are each their own bespoke shape (purchase:
// vendor/items[]/paymentMethod; packing: brandName/location/paymentMethod/
// itemQty/cost; deployment: who/date/renewalDate/cost).
export const CHECKLIST_MODULE_KEYS = MODULE_KEYS.filter(
  (k) => k !== 'purchase' && k !== 'packing' && k !== 'deployment'
);
