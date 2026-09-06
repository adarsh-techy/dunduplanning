import Feature from '../models/Feature.js';
import { LAUNCH_STATUS_MAP, withLaunchStatusPrefix } from './launchPlanStatus.js';

// A readable feature catalog for the Dundu-Online app (D:\PROJECTS\Dundu-Online)
// -- unlike App Progress (a build-status checklist), each row here has a real
// description explaining what the feature does and how, so its detail page
// can be read start to finish to understand that one feature completely.
// Grounded in that project's spec.md, CLAUDE.md and planning/Dundu_Launch_Plan.pdf.
const RAW_ITEMS = [
  // -- Customer Experience -------------------------------------------------
  ['Customer Experience', 'Login & Signup', 'Built',
    'Customers can create an account and sign in by email/password, WhatsApp or SMS OTP (no password needed), or one-tap Google login. Sessions are kept with a JWT token so the app remembers you between visits.',
    'Backend: auth.routes.js, passport.js (Google OAuth), otp.service.js.'],
  ['Customer Experience', 'Product Catalog & Details', 'Built',
    'Browse products by category (Women, Kids, Newborn, Maternity) with filters for brand, material and type. Each product page shows multiple images, lets you pick a size and color, and suggests related products.',
    'Backend: product.routes.js, category.routes.js.'],
  ['Customer Experience', 'Product Reviews & Ratings', 'Built',
    "Customers who bought a product can leave a star rating and written review. Admin can approve or hide reviews, or write admin-authored reviews to seed early social proof before real reviews come in.",
    'Backend: review.controller.js (customer + admin).'],
  ['Customer Experience', 'Shopping Cart', 'Built',
    'Add products to a cart, change quantity, or remove items. The cart is tied to the logged-in account so it stays in sync if you switch from mobile to web.',
    'Backend: cart.routes.js, cart.controller.js.'],
  ['Customer Experience', 'Checkout & Coupon Apply', 'Built',
    'At checkout, pick a saved delivery address (or add a new one), apply a coupon code for a discount, then choose how to pay before placing the order.',
    'Backend: order.routes.js, coupon.routes.js.'],
  ['Customer Experience', 'Payment Gateway (Razorpay)', 'Partial',
    'Card, UPI and netbanking payments are processed through the Razorpay checkout widget; the backend verifies the payment signature before confirming the order so a fake "success" can\'t be spoofed client-side.',
    'Cashfree and PhonePe are named in the spec as alternative gateways but have no backend code yet -- only Razorpay is wired up. See payment.service.js.'],
  ['Customer Experience', 'Order Placement & Tracking', 'Built',
    'After checkout, an order record is created with every line item, the chosen address and payment details. Customers can see the order move through Pending -> Packed -> Shipped -> Delivered, and browse their full order history.',
    'Backend: order.routes.js (customer), order.controller.js.'],
  ['Customer Experience', 'Order Cancellation', 'Built',
    'A customer can cancel their own order while it hasn\'t shipped yet, straight from the Order Detail screen.',
    ''],
  ['Customer Experience', 'Return Requests', 'Partial',
    "If an order has been delivered, the customer can request a return from Order Detail. A branch admin with the 'returns' permission then approves or rejects it under Admin > Returns.",
    'The request/approval flow works today, but what happens after approval (refund method, who pays return shipping, exchange vs refund-only) is still an open business decision -- see the Refund Method / Exchange vs Refund-Only items.'],
  ['Customer Experience', 'Wishlist', 'Built',
    'Customers can save products they like for later without adding them to the cart. Admin can see aggregate wishlist activity per customer.',
    'Backend: wishlist.controller.js (customer + admin).'],
  ['Customer Experience', 'Profile & Saved Addresses', 'Built',
    'Customers can edit their name and contact details and keep multiple delivery addresses on file, picking one at checkout instead of retyping it every time.',
    'Backend: user.routes.js (customer).'],

  // -- Delivery ---------------------------------------------------------------
  ['Delivery', 'In-House Delivery (Delivery Staff App)', 'Built',
    'A delivery-staff person logs into the same mobile app as customers but sees a different set of screens: Home -> scan the order\'s pickup QR code -> mark it delivered. Who picked it up/delivered it and exactly when is recorded automatically.',
    'delivery_qr_token, picked_up_by/at, delivered_by/completed_at columns on the order.'],
  ['Delivery', '3rd-Party Courier Tracking', 'Built',
    "For orders shipped through an outside courier instead of in-house staff, admin manually types in the courier's name, tracking number and phone so the customer can look it up.",
    'Manual entry only -- there is no live integration with a courier\'s tracking API yet.'],
  ['Delivery', 'Order Status WhatsApp Notifications', 'Built',
    'Customers get an automatic WhatsApp message when their order is packed, shipped, or delivered, so they don\'t have to keep checking the app.',
    'Needs live WhatsApp Business API credentials configured before it will actually send anything.'],
  ['Delivery', 'Delivery & Return Settings', 'Built',
    'Admin screens exist for configuring delivery rules (fees/zones) and the return policy (window, terms).',
    'The screens are built, but the real numbers/policy (e.g. exact return window, delivery fee rule) are still a business decision, not yet finalized.'],

  // -- Marketing & Engagement -----------------------------------------------
  ['Marketing & Engagement', 'Combos (Product Bundles)', 'Partial',
    'Admin builds a bundle of specific products sold together at one combo price (with its own offer price and stock count), which shoppers can buy as a single item.',
    'Available in the admin panel and mobile app; no web storefront UI yet.'],
  ['Marketing & Engagement', 'Coupons', 'Built',
    'Admin creates discount codes (flat amount or percentage) that customers type in at checkout to get money off their order.',
    ''],
  ['Marketing & Engagement', 'Loyalty Cards', 'Built',
    'Every customer, tracked by phone number, earns points and has their total spend recorded, which can be used toward rewards on a future purchase.',
    ''],
  ['Marketing & Engagement', 'Referral System', 'Built',
    'Each customer gets a unique referral code to share with friends. When someone signs up using that code and completes a qualifying purchase, both people get a reward.',
    ''],
  ['Marketing & Engagement', 'Spin Wheel', 'Partial',
    'A gamified popup where the customer spins a wheel to win one of several prizes, weighted so rarer prizes come up less often. Admin can target it at new/existing/VIP customers, restrict it to a time window, and see a log of who won what.',
    'On the web storefront it currently only applies a win passively in the background rather than showing the actual spinning-wheel animation like mobile does.'],
  ['Marketing & Engagement', 'Scratch Card', 'Partial',
    'A "scratch to reveal a prize" popup game, with a pool of possible prizes, a minimum order size to qualify, a cooldown between plays, and an active date window.',
    'No web storefront version exists -- mobile and admin config only.'],
  ['Marketing & Engagement', 'Festival Theme', 'Partial',
    'Admin can turn on a seasonal theme (a name, emoji, color scheme and banner) for events like Diwali or a New Year sale, optionally with a popup offering a coupon.',
    'No web storefront version exists -- mobile only.'],
  ['Marketing & Engagement', 'First Purchase Offer', 'Partial',
    "A discount (flat amount, or based on order value) automatically applied -- or given as a coupon -- specifically for a customer's very first order, to encourage them to complete it.",
    'The settings exist in the admin panel, but no confirmed screen on web or mobile actually shows/applies it to the shopper yet -- verify before relying on it.'],
  ['Marketing & Engagement', 'Birthday Campaign', 'Built',
    "Seven days before a customer's birthday, the system automatically looks them up and sends a WhatsApp message with a configurable discount, as a small personal touch that also drives a sale.",
    ''],
  ['Marketing & Engagement', 'Free Shipping Nudge', 'Partial',
    'A message shown in the cart telling the shopper how much more they need to add to unlock free shipping, to nudge them toward a bigger order.',
    'Exists in the mobile app (Rs.500 threshold seen); not confirmed as present on the web storefront.'],
  ['Marketing & Engagement', 'Announcements Bar', 'Built',
    'A scrolling marquee message across the top of the storefront -- text and colors are configurable, and it can be switched on/off -- used for site-wide notices like a sale or a shipping delay.',
    ''],
  ['Marketing & Engagement', 'Home Banners', 'Built',
    'A rotating image slider on the home screen, each banner with an optional badge label and color, used to promote sales, new collections or seasonal campaigns.',
    ''],
  ['Marketing & Engagement', 'New Arrivals', 'Built',
    'Admin flags specific products as "new arrival" so they automatically appear in a dedicated section on the home screen.',
    ''],
  ['Marketing & Engagement', 'WhatsApp Broadcast', 'Built',
    'Admin can send a one-off bulk WhatsApp message to some or all customers -- for announcing a sale, a new collection, etc.',
    'Needs live WhatsApp Business API credentials configured before it will actually send anything.'],

  // -- Admin & Analytics ---------------------------------------------------
  ['Admin & Analytics', 'Admin Dashboard', 'Built',
    'The first screen an admin sees: total sales, total orders, total users, a revenue graph over time, and a feed of the most recent orders, all in one place.',
    ''],
  ['Admin & Analytics', 'Inventory Dashboard', 'Built',
    'Live stock levels across every product and each of its size/color variants, so low-stock situations get caught before they become a stockout.',
    ''],
  ['Admin & Analytics', 'Product Insights', 'Built',
    'A set of tabs breaking down which categories are performing best, overall product demand trends, and which specific size/color variants sell the most.',
    ''],
  ['Admin & Analytics', 'Sales & Finance Reports', 'Built',
    'A daily sales report for branch-level billing reconciliation, plus a higher-level finance report rolling up revenue across the whole business.',
    ''],
  ['Admin & Analytics', 'User Activity & Insights', 'Built',
    'Per-customer login history and product-view logs, aggregated into behaviour stats that admins can use to understand what shoppers are actually doing.',
    ''],
  ['Admin & Analytics', 'Birthday Ticker', 'Built',
    'A small widget in the admin panel\'s top bar listing customers whose birthdays are coming up soon, so staff can plan manual outreach alongside the automated Birthday Campaign.',
    ''],

  // -- Admin & Operations ---------------------------------------------------
  ['Admin & Operations', 'Admin & Role Management', 'Built',
    'The Super Admin can create branch-level Admin accounts and assign each one a specific set of permissions (billing, orders, returns, loyalty, reports) along with which branch they\'re allowed to access.',
    ''],
  ['Admin & Operations', 'Delivery Staff Accounts', 'Built',
    'A separate roster of delivery-staff logins, kept distinct from shopper accounts and branch admins, managed by the Super Admin.',
    ''],
  ['Admin & Operations', 'Payment Methods Configuration', 'Built',
    'An admin screen for choosing which payment methods the store accepts.',
    'The screen exists, but the backend payment code underneath it currently only actually supports Razorpay.'],
  ['Admin & Operations', 'Mobile Splash Screen & Update Notice', 'Built',
    'A configurable splash screen shown when the mobile app launches, plus a force-update or soft-update prompt admin can trigger when customers need to update to a newer app version.',
    ''],

  // -- Planned / Future Features --------------------------------------------
  ['Planned / Future Features', 'Wallet', 'Not Started',
    'A stored-balance wallet customers could use for refunds or store credit instead of a bank transfer, and spend on future orders.',
    'wallet.routes.js / wallet.controller.js / wallet.service.js already exist in the backend as scaffolding, but it is not wired into checkout or exposed to customers yet -- treat as not usable until confirmed otherwise.'],
];

// Seeds the Features catalog only if it's empty, so this is safe to re-run
// and won't duplicate or overwrite anything already edited.
export const seedFeatureCatalog = async (createdById) => {
  const count = await Feature.countDocuments();
  if (count > 0) {
    console.log(`Features catalog already has items (${count}), skipping seed.`);
    return;
  }

  const docs = RAW_ITEMS.map(([category, title, label, description, note], index) => ({
    category,
    title,
    status: LAUNCH_STATUS_MAP[label],
    description,
    notes: withLaunchStatusPrefix(label, note),
    order: index,
    createdBy: createdById,
  }));

  await Feature.insertMany(docs);
  console.log(`Seeded ${docs.length} feature catalog items for the Dundu-Online app.`);
};
