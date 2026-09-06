import AppFeature from '../models/AppFeature.js';
import { LAUNCH_STATUS_MAP, withLaunchStatusPrefix } from './launchPlanStatus.js';

// Imported from D:\PROJECTS\Dundu-Online\planning\Dundu_Launch_Plan.pdf
// (prepared 2026-09-04, grounded in that project's actual codebase).
const RAW_ITEMS = [
  // -- Platforms --------------------------------------------------------
  ['Platforms', 'Admin Panel (admin/)', 'Built', 'React.js + Tailwind CSS, Vite :3001. Manages the entire online store.'],
  ['Platforms', 'Web Storefront (web/)', 'Built', 'React.js, Vite :3000. Public storefront + account area.'],
  ['Platforms', 'Mobile App (mobile/)', 'Built', 'React Native, Expo SDK 54. Two nav worlds: shopping app vs delivery-staff app, from one login.'],
  ['Platforms', 'Backend API (backend/)', 'Built', 'Node.js + Express, :5000. PostgreSQL DB; REST API under /api.'],
  ['Platforms', 'Offline System (dundu-offline/)', 'Not Started', 'React + Node, planned :5001. Folder does not exist yet -- separate DB (dundu_offline), no shared code with online system.'],

  // -- Customer App -- Core Flows (spec.md section 1) --------------------
  ['Customer App', 'Login / Signup / OTP / Google Login', 'Built', 'Backend routes present (auth.routes.js, passport.js Google OAuth); web + mobile clients implemented.'],
  ['Customer App', 'Home (Banners, Categories, New Arrivals, Offers)', 'Built', 'category.routes.js, banner + new-arrival flags on products.'],
  ['Customer App', 'Product Browsing & Details', 'Built', 'product.routes.js -- images, size/color selection, reviews, related products.'],
  ['Customer App', 'Cart (Add / Update / Remove)', 'Built', 'cart.routes.js, cart.controller.js.'],
  ['Customer App', 'Checkout (Address, Coupon, Payment Selection)', 'Built', 'order.routes.js, coupon.routes.js.'],
  ['Customer App', 'Orders (Place / Track / History / Cancel / Return)', 'Built', 'order.routes.js, delivery.routes.js.'],
  ['Customer App', 'Profile (Edit, Addresses, Wishlist, Notifications)', 'Built', 'user.routes.js, wishlist.controller.js.'],

  // -- Dashboard & Analytics ---------------------------------------------
  ['Dashboard & Analytics', 'Dashboard', 'Built', 'Total sales, total orders, total users, revenue graph, recent orders.'],
  ['Dashboard & Analytics', 'Inventory Dashboard', 'Built', 'Stock levels across products/variants.'],
  ['Dashboard & Analytics', 'Product Insights', 'Built', 'Overview / Categories / Product Demand / Variants tabs.'],
  ['Dashboard & Analytics', 'Sales Report', 'Built', 'Daily sales report (branch billing).'],
  ['Dashboard & Analytics', 'Finance Report', 'Built', 'Revenue/finance rollups.'],
  ['Dashboard & Analytics', 'User Activity', 'Built', 'Login logs + product view logs per user.'],
  ['Dashboard & Analytics', 'User Insights', 'Built', 'Aggregated customer behaviour stats.'],
  ['Dashboard & Analytics', 'Birthday Ticker', 'Built', 'Upcoming customer birthdays, shown in TopBar.'],

  // -- Catalog Management --------------------------------------------------
  ['Catalog Management', 'Products', 'Built', 'Add/Edit/Delete/Hide, Mark Featured, Mark Offer Product. Fields: category, name, brand, description, material, type, gender, age group, size, color, price, offer price, stock, SKU, product code, images, variants.'],
  ['Catalog Management', 'Categories', 'Built', 'Women, Kids, Newborn, Maternity.'],
  ['Catalog Management', 'Combos', 'Built', 'Bundle builder: combo price/offer price/stock + selectable product slots. No web UI yet -- admin + mobile only.'],
  ['Catalog Management', 'Brands', 'Built', 'Brand list management.'],
  ['Catalog Management', 'Product Materials', 'Built', 'Material list management.'],
  ['Catalog Management', 'Reviews', 'Built', 'Approve/manage customer reviews, or create admin-authored reviews.'],
  ['Catalog Management', 'New Arrivals', 'Built', 'Flag/curate new-arrival products.'],

  // -- Orders & Fulfilment (Admin) -----------------------------------------
  ['Orders & Fulfilment', 'Order List / Detail', 'Built', 'Full order record, line items, customer, address.'],
  ['Orders & Fulfilment', 'Order Status Update', 'Built', 'Pending -> Packed -> Shipped -> Delivered.'],
  ['Orders & Fulfilment', 'Invoice Download', 'Built', 'PDF invoice per delivered order.'],
  ['Orders & Fulfilment', 'Returns', 'Built', 'Approve / Reject return requests. Permission-gated (\'returns\') for branch admins.'],
  ['Orders & Fulfilment', 'Cart Monitor', 'Built', 'View active carts + abandoned-cart tracking.'],
  ['Orders & Fulfilment', 'Wishlists', 'Built', 'View customer wishlists.'],

  // -- Marketing & Engagement -----------------------------------------------
  ['Marketing & Engagement', 'Announcements', 'Built', 'Top-bar marquee text, colors, active toggle.'],
  ['Marketing & Engagement', 'Banners', 'Built', 'Home banner slider + badge text/color.'],
  ['Marketing & Engagement', 'Coupons', 'Built', 'Coupon codes applied at checkout.'],
  ['Marketing & Engagement', 'Loyalty Cards', 'Built', 'Points + total spend, keyed by phone number.'],
  ['Marketing & Engagement', 'Referral System', 'Built', 'Referral code per user, reward on successful referral.'],
  ['Marketing & Engagement', 'WhatsApp Broadcast', 'Built', 'Bulk WhatsApp message to customer list. Needs live WhatsApp API creds.'],
  ['Marketing & Engagement', 'Spin Wheel', 'Built', 'Weighted prize segments, per-user targeting (new/existing/VIP), time-slot windows, forced popup, redemption log. Web: passive only (auto-applies a won reward).'],
  ['Marketing & Engagement', 'Scratch Card', 'Built', 'Prize pool, min-order eligibility, cooldown, date window, forced popup. No web UI.'],
  ['Marketing & Engagement', 'Festival Theme', 'Built', 'Seasonal name/emoji/colors/banner + optional popup with coupon. No web UI.'],
  ['Marketing & Engagement', 'First Purchase Offer', 'Built', 'Flat discount or order-value slabs, auto-apply or coupon. No dedicated web/mobile UI found -- verify before relying on it.'],
  ['Marketing & Engagement', 'Birthday Campaign', 'Built', '7-day-ahead lookup, WhatsApp send, configurable discount %.'],
  ['Marketing & Engagement', 'Free Shipping Nudge', 'Partial', 'Threshold-based nudge (Rs.500 seen in mobile). Mobile only -- check web gap.'],

  // -- Users, Staff & Settings ------------------------------------------------
  ['Users, Staff & Settings', 'User List / Detail', 'Built', 'Browse customers, block user, order history, addresses.'],
  ['Users, Staff & Settings', 'Admins', 'Built', 'Add admin, assign role & permissions, branch access. Permission set: billing, orders, returns, loyalty, reports.'],
  ['Users, Staff & Settings', 'Delivery Staff', 'Built', 'Manage delivery-staff accounts.'],
  ['Users, Staff & Settings', 'General Settings', 'Built', 'Store-wide configuration.'],
  ['Users, Staff & Settings', 'Payment Methods', 'Built', 'Configure accepted payment methods. Backend gateway code covers Razorpay only.'],
  ['Users, Staff & Settings', 'Delivery Settings', 'Built', 'Delivery rules configuration. Confirm shipping-fee rule engine is complete.'],
  ['Users, Staff & Settings', 'Return Settings', 'Built', 'Return-policy configuration. Actual policy values still a business decision.'],
  ['Users, Staff & Settings', 'Splash Screen', 'Built', 'Mobile app splash screen config.'],
  ['Users, Staff & Settings', 'App Update Notice', 'Built', 'Force/soft update messaging for mobile app.'],

  // -- Delivery -------------------------------------------------------------
  ['Delivery', 'In-house Delivery Flow', 'Built', 'Delivery-staff role in mobile app: Home -> Scan pickup QR -> Complete delivery. delivery_qr_token, picked_up_by/at, delivered_by/completed_at all tracked.'],
  ['Delivery', '3rd-Party Courier Fields', 'Built', 'courier_name / courier_tracking_number / courier_phone stored on order. Manual entry only -- no live courier API integration.'],
  ['Delivery', 'Order Status Notifications', 'Built', 'WhatsApp message on Packed/Shipped/Delivered. Needs live WhatsApp API credentials to actually send.'],
  ['Delivery', 'Delivery Zones / Serviceable Areas', 'Not Started', 'Define which pin codes / cities are serviceable. Business decision.'],
  ['Delivery', 'Delivery Charges Rule', 'Partial', 'Flat fee, distance-based, or free-above-threshold. Rs.500 free-shipping nudge exists in mobile; confirm full rule in Admin > Delivery Settings.'],
  ['Delivery', 'Delivery Timeline / SLA', 'Not Started', 'Target duration for each status step, communicated to customer. Business decision.'],

  // -- Returns ----------------------------------------------------------------
  ['Returns', 'Return Window', 'To Decide', "E.g. '7 days from delivery' -- exact number still to decide. return_status + return_requested states already exist in schema."],
  ['Returns', 'Return Request Flow', 'Built', 'Customer requests a return from Order Detail (web & mobile).'],
  ['Returns', 'Return Approval', 'Built', "Admin approves/rejects under Admin > Returns. Permission-gated ('returns')."],
  ['Returns', 'Refund Method', 'Not Started', 'Original payment method vs wallet credit vs bank transfer. Business decision -- no wallet system built yet.'],
  ['Returns', 'Exchange vs Refund-Only', 'Not Started', 'Whether size/color exchange is offered, or refund only. Business decision.'],
  ['Returns', 'Return Shipping Cost', 'Not Started', 'Who bears the return freight -- customer or Dundu. Business decision.'],
  ['Returns', 'COD Order Refunds', 'Not Started', 'Refund route for orders with no original online payment. Business decision -- likely bank transfer/UPI payout.'],

  // -- Business Identity Setup --------------------------------------------------
  ['Business Identity Setup', 'Business Bank Account', 'To Decide', "Current account in Dundu's registered business name. Receive gateway settlements (Razorpay/Cashfree/PhonePe) + COD reconciliation."],
  ['Business Identity Setup', 'Business PAN / GST', 'To Decide', 'Registered as required for the business entity. Required to open current account + gateway KYC.'],
  ['Business Identity Setup', 'Dundu Business Phone Number', 'To Decide', 'A dedicated number, not a personal one. Customer support line shown in app/web footer & invoices.'],
  ['Business Identity Setup', 'WhatsApp Business Number', 'To Decide', 'Order status messages, OTP, marketing broadcast, cart-reminder nudges. Backend service exists; needs live API credentials.'],
  ['Business Identity Setup', 'Business Email', 'To Decide', 'Support inbox, password-reset emails, invoices, Play Store/App Store developer contact.'],
  ['Business Identity Setup', 'Domain Name', 'To Decide', 'Web hosting, business email, brand presence.'],
  ['Business Identity Setup', 'User Phone Verification (OTP)', 'Needs Fix', "otp.service.js queries columns (target/purpose) that don't exist in the otps table -- verify/fix before go-live."],
  ['Business Identity Setup', 'User Email Verification', 'Not Started', 'Optional extra verification / recovery channel. Decide if needed before launch.'],

  // -- Deployment ---------------------------------------------------------------
  ['Deployment', 'Backend Hosting', 'To Decide', 'Cloud VM/container host (Railway, Render, DigitalOcean, AWS, etc.) + PostgreSQL DB provisioning. docker-compose.yml already containerizes backend+db.'],
  ['Deployment', 'Web + Admin Hosting', 'To Decide', 'Domain + SSL + nginx serving web(:3000) & admin(:3001), proxying /api & /uploads to backend. Covered by root docker-compose.yml.'],
  ['Deployment', 'Production Environment Secrets', 'To Decide', 'Real values for JWT secret, Razorpay keys, Twilio creds, Cloudinary, Google OAuth. Full list in backend/.env.example.'],
  ['Deployment', 'Database Migration on Deploy', 'To Decide', 'Run node-pg-migrate on first boot & after every new migration -- not automatic.'],
  ['Deployment', 'Payment Gateway -- Live Keys', 'Partial', 'Razorpay live mode credentials + business KYC. Cashfree / PhonePe named in spec but not coded yet.'],
  ['Deployment', 'Android Build', 'Not Started', 'Expo EAS Build -> .aab. mobile/ is Expo SDK 54, EAS-ready.'],
  ['Deployment', 'Google Play Store Listing', 'Not Started', 'Developer account (~$25 one-time), store listing, screenshots, privacy policy, content rating, internal test -> production rollout.'],
  ['Deployment', 'iOS Build', 'Not Started', 'Expo EAS Build -> .ipa.'],
  ['Deployment', 'Apple App Store Listing', 'Not Started', 'Apple Developer account (~$99/yr), App Store Connect listing, screenshots, privacy nutrition label, App Review.'],
  ['Deployment', 'Mobile Config for Production', 'Not Started', 'Point EXPO_PUBLIC_API_URL at the live backend domain. Currently falls back to a hardcoded dev LAN IP if unset.'],
  ['Deployment', 'Offline System Build + Deploy', 'Not Started', 'dundu-offline/ super-admin + branch-admin + backend-offline, separate deploy on :5001. Code doesn\'t exist yet -- fully separate project.'],

  // -- Recommended Future Features (spec section 6) -----------------------------
  ['Recommended Future Features', 'Wallet', 'Not Started', 'Recommended future feature (spec section 6). Note: wallet.routes.js/wallet.controller.js/wallet.service.js already exist as scaffolding in the backend -- verify actual completion state.'],
  ['Recommended Future Features', 'Multi-language Support', 'Not Started', 'Recommended future feature (spec section 6).'],
  ['Recommended Future Features', 'Live Delivery Tracking', 'Not Started', 'Recommended future feature (spec section 6).'],
  ['Recommended Future Features', 'AI Product Suggestions', 'Not Started', 'Recommended future feature (spec section 6).'],
  ['Recommended Future Features', 'Vendor Panel', 'Not Started', 'Recommended future feature (spec section 6).'],
];

// Seeds the App Progress checklist only if it's empty, so this is safe to
// re-run and won't duplicate or overwrite anything already edited.
export const seedAppFeatures = async (createdById) => {
  const count = await AppFeature.countDocuments();
  if (count > 0) {
    console.log(`App Progress already has items (${count}), skipping seed.`);
    return;
  }

  const docs = RAW_ITEMS.map(([category, title, label, note], index) => ({
    category,
    title,
    status: LAUNCH_STATUS_MAP[label],
    notes: withLaunchStatusPrefix(label, note),
    order: index,
    createdBy: createdById,
  }));

  await AppFeature.insertMany(docs);
  console.log(`Seeded ${docs.length} App Progress items from the Dundu-Online launch plan.`);
};
