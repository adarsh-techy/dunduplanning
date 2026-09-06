import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { seedSuperAdmin } from './seedSuperAdmin.js';
import { seedDefaultSteps } from './seedDefaultSteps.js';
import { seedAppFeatures } from './seedAppFeatures.js';
import { seedFeatureCatalog } from './seedFeatureCatalog.js';
import { seedDefaultPacking } from './seedDefaultPacking.js';

const run = async () => {
  try {
    await connectDB();
    const superAdmin = await seedSuperAdmin();
    await seedDefaultSteps(superAdmin._id);
    await seedAppFeatures(superAdmin._id);
    await seedFeatureCatalog(superAdmin._id);
    await seedDefaultPacking(superAdmin._id);
    console.log('Seeding complete.');
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
