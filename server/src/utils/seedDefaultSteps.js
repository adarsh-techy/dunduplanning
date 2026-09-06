import Step from '../models/Step.js';

const DEFAULT_STEPS = [
  {
    title: 'SIM Card Registration',
    description: 'Register a business SIM card / mobile number for the venture.',
  },
  {
    title: 'Bank Account Opening',
    description: 'Open a current/business bank account.',
  },
  {
    title: 'Udyam Registration (MSME)',
    description: 'Register the business under Udyam (MSME) registration.',
  },
  {
    title: 'GST Registration',
    description: 'Obtain GST registration and GSTIN for the business.',
  },
  {
    title: 'Panchayat Trade Permission',
    description: 'Obtain Gram Panchayat / local body trade license or permission.',
  },
];

// Seeds the default planning checklist only if no steps exist yet, so this
// is safe to re-run and won't duplicate steps the super admin has edited.
export const seedDefaultSteps = async (createdById) => {
  const count = await Step.countDocuments();
  if (count > 0) {
    console.log(`Steps already exist (${count}), skipping default step seed.`);
    return;
  }

  const docs = DEFAULT_STEPS.map((step, index) => ({
    ...step,
    order: index,
    createdBy: createdById,
  }));

  await Step.insertMany(docs);
  console.log(`Seeded ${docs.length} default planning steps.`);
};
