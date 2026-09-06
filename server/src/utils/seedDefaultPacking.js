import Packing from '../models/Packing.js';

const DEFAULT_ITEMS = [
  {
    title: 'Packing Cover / Packaging Material',
    description: 'Poly bags, boxes, bubble wrap and tape used to pack each order for shipping.',
  },
  {
    title: 'Invoice Printing',
    description: 'Printer setup and invoice format/layout for the paper invoice included in every package.',
  },
  {
    title: 'Shipping Label Printing',
    description: 'Address label printed and stuck on each package before handover to delivery/courier.',
  },
  {
    title: 'Barcode / QR Code Printing',
    description: 'Pickup QR code printed and attached per order, used by delivery staff to scan and confirm pickup.',
  },
  {
    title: 'Packing Checklist / SOP',
    description: 'Step-by-step packing process (verify order, quality-check item, pack, seal, label) to avoid wrong or damaged shipments.',
  },
  {
    title: 'Branding Materials',
    description: 'Thank-you card, branded tape or stickers included in the package for a better unboxing experience.',
  },
];

// Seeds the default packing checklist only if no items exist yet, so this
// is safe to re-run and won't duplicate items the super admin has edited.
export const seedDefaultPacking = async (createdById) => {
  const count = await Packing.countDocuments();
  if (count > 0) {
    console.log(`Packing items already exist (${count}), skipping default packing seed.`);
    return;
  }

  const docs = DEFAULT_ITEMS.map((item, index) => ({
    ...item,
    order: index,
    createdBy: createdById,
  }));

  await Packing.insertMany(docs);
  console.log(`Seeded ${docs.length} default packing items.`);
};
