// Single source of truth for the app's permission-gated modules. Admins get
// granted access per module here; Super Admins always have all of them.
export const MODULES = [
  { key: 'planning', label: 'Planning', icon: '📋' },
  { key: 'app', label: 'App Progress', icon: '📱' },
  { key: 'features', label: 'Features', icon: '✨' },
  { key: 'purchase', label: 'Purchase', icon: '🛒' },
  { key: 'packing', label: 'Packing', icon: '📦' },
  { key: 'delivery', label: 'Delivery', icon: '🚚' },
  { key: 'marketing', label: 'Marketing', icon: '📣' },
];

export const MODULE_KEYS = MODULES.map((m) => m.key);

// planning/marketing/features/delivery all share the exact same checklist
// shape (title/status/cost/dueDate/notes/attachments); purchase is its own
// distinct shape (quantity/unitCost/vendor/etc).
export const CHECKLIST_MODULE_KEYS = MODULE_KEYS.filter((k) => k !== 'purchase');
