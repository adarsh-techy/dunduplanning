// Mirrors the backend's module list (server/src/config/modules.js). Single
// place to add a module's checkbox/label wherever permissions are shown.
// Order here also drives the sidebar's nav order (after Dashboard).
export const MODULES = [
  { key: 'planning', label: 'Planning', icon: '📋', hint: 'business setup steps' },
  { key: 'app', label: 'App Progress', icon: '📱', hint: 'Dundu-Online build tracker' },
  { key: 'deployment', label: 'Deployment', icon: '🚀', hint: 'hosting & deployment cost' },
  { key: 'features', label: 'Features', icon: '✨', hint: 'product/business features' },
  { key: 'purchase', label: 'Purchase', icon: '🛒', hint: 'expense tracking' },
  { key: 'packing', label: 'Packing', icon: '📦', hint: 'packing & fulfillment ops' },
  { key: 'delivery', label: 'Delivery', icon: '🚚', hint: 'logistics planning' },
  { key: 'marketing', label: 'Marketing', icon: '📣', hint: 'campaigns & spend' },
];
