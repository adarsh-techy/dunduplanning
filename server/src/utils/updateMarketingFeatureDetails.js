import 'dotenv/config';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import Feature from '../models/Feature.js';

// One-time enrichment: replaces the brief Marketing & Engagement descriptions
// with the full, real rules read directly from Dundu-Online's backend
// controllers (D:\PROJECTS\Dundu-Online\backend\src\controllers\admin\marketing
// and \customer\spinWheel), so each detail page fully explains every
// condition -- not just what the feature is, but exactly how/when it fires.
const UPDATES = [
  {
    title: 'Spin Wheel',
    description:
      "A gamified popup where the shopper spins a wheel and wins one of several prizes. Which prize is won is a weighted random roll: each active prize (\"segment\") has a probability weight, and the wheel picks by rolling a random number against the total weight of all segments — a higher weight means that prize comes up more often. Segments can also be restricted to a specific customer tier via target_user_type: new users (0 completed orders), existing users (1-2), VIP users (3+), or left open to everyone.\n\n" +
      "Before a spin is allowed, conditions are checked in this order: (1) the wheel must be enabled globally, (2) if login is required, the shopper must be logged in or supply a phone number, (3) a minimum completed-orders count can be required — if not set, brand-new customers with zero orders are blocked by default, since they already get the separate First Purchase Offer instead, (4) an optional active-date window (active_from / active_until) restricts the whole promotion to a campaign period, (5) a time-of-day window restricts spins to \"anytime\" between two clock times, or to named morning / evening / night slots (or all three), (6) a cooldown in hours (default 24) blocks a repeat spin until it elapses, alongside a max-spins-per-day cap.\n\n" +
      "Admin can override every one of those rules for specific people: \"Force Popup\" re-enables the wheel instantly for one user, a list of users, or literally everyone regardless of cooldown or eligibility; a per-user target rule can guarantee a specific segment (or a one-off custom prize) the next time that person spins, which is consumed and removed once claimed. Winning a coupon or free-shipping prize auto-creates a real, working coupon code; winning loyalty points credits that phone number's loyalty card directly. Every spin — win or lose — is written to a redemption log with a running total spin count admin can review.",
    notes: '[Partial] On the web storefront it currently only applies a win passively in the background rather than showing the actual spinning-wheel animation like mobile does. Backend: spinWheel.controller.js (admin + customer), 7 migrations.',
  },
  {
    title: 'Scratch Card',
    description:
      'A "scratch to reveal a prize" popup, run on the same idea as Spin Wheel but with its own settings and prize pool. Prizes (cashback, a discount coupon, free shipping, or "better luck next time") each carry their own weighted probability, color and coupon code; if admin hasn\'t configured any yet, four sensible defaults are auto-created the first time the config screen loads (₹100 cashback, 15% off, a free-delivery pass, and a no-prize outcome) so the feature always has something to show.\n\n' +
      'Before a shopper can scratch, all of these are checked: the feature must be enabled; their order total must meet a configurable minimum order value (₹499 by default) — this can further be restricted to prepaid orders only, Cash-on-Delivery only, or either; a minimum completed-orders count can be required; an active date-range window can confine it to a campaign period; and a cooldown in hours (default 24) plus a max-scratches-per-day cap stop repeat plays. A winning coupon or cashback prize can be set to auto-grant (applied immediately, no separate claim step). Admin can force the popup open for one specific customer regardless of the rules above, and every scratch is logged with the prize won, giving a running total admin can review.',
    notes: '[Partial] No web storefront version exists -- mobile and admin config only. Backend: scratchCard.controller.js.',
  },
  {
    title: 'Festival Theme',
    description:
      "Switches the entire storefront into a seasonal look for events like Diwali, New Year or a flash sale — a festival name, an emoji, a background color, a top navbar color and its text color, and an optional logo, all applied site-wide the instant it's turned on. A separate popup can be layered on top, with its own heading, subtext, a badge label, a call-to-action button (its own text and color), an attached coupon code, and an expiry timestamp after which the popup stops showing itself automatically. A banner-text field can also surface a themed message elsewhere on the site. Every color field is validated as a real hex code (e.g. #e91e8c) before saving, so a typo can't silently break the site's styling.",
    notes: '[Partial] No web UI. Backend: festival.controller.js -- settings-table only, admin config screen exists but no dedicated web/mobile consuming screen has been confirmed.',
  },
  {
    title: 'First Purchase Offer',
    description:
      "A discount automatically applied on a customer's very first order — the incentive that replaces Spin Wheel for brand-new signups, since new-user accounts (0 completed orders) are deliberately blocked from that feature by default. It can be one flat discount amount, or tiered \"slabs\" based on order value; the built-in defaults are: spend up to ₹500 → ₹50 off, ₹500–1000 → ₹100 off, ₹1000–1500 → ₹150 off, above ₹1500 → ₹200 off (all fully editable by admin). It can auto-apply at checkout with no code needed, or be given as a coupon (default code WELCOME100) the customer types in — whichever code is configured is kept automatically in sync with the real coupons table so it actually works. The admin screen for this feature also shows live stats: how many customers have claimed it, total discount given away, and total revenue from those orders.",
    notes: '[Partial] The settings exist in the admin panel, but no confirmed screen on web or mobile actually surfaces/applies it to the shopper yet -- verify before relying on it. Backend: firstPurchase.controller.js.',
  },
  {
    title: 'Coupons',
    description:
      'Admin creates a discount code with a discount type (percentage or fixed amount), the discount value, an optional minimum order value to qualify, an optional maximum-discount cap (limits how much a percentage-off coupon can save on a large order), a usage limit, and an expiry date. Each coupon can be toggled active/inactive without deleting it, and is applied by the customer typing the code in at checkout.',
    notes: '',
  },
  {
    title: 'Loyalty Cards',
    description:
      "Every customer is tracked by phone number rather than account, so it still works even for a guest checkout. Points and total spend can be rebuilt automatically straight from real order history: for every ₹500 spent on a paid order, 20 points are earned, and any loyalty discount already redeemed on an order is subtracted back out — so a re-sync always reconciles the balance to what actually happened. Admin can also directly create or adjust a specific phone number's card: set an absolute points total, add/subtract a delta, or edit total spend by hand.",
    notes: '',
  },
  {
    title: 'Referral System',
    description:
      "Every customer gets a personal referral code. When someone new signs up using that code and later completes a qualifying order, a reward record is created for the referrer — starting as pending, then flipped to used once it's actually redeemed. Admin has a stats view (total referrals, pending rewards, used rewards) and a full log showing who referred whom, the discount percentage earned, and which order triggered the reward.",
    notes: '',
  },
  {
    title: 'Announcements Bar',
    description:
      "A scrolling marquee banner across the top of the storefront. Admin can create several at once, each with its own text, background color, text color and sort order (so more than one can rotate), a scheduled time so one only starts appearing from a chosen moment, a per-announcement active/inactive toggle, and a separate toggle to show it as a popup instead of (or alongside) the bar.",
    notes: '',
  },
  {
    title: 'Home Banners',
    description:
      "A rotating image slider on the home screen. Each banner has an uploaded image, a title, a subtitle, an optional link (e.g. to a category or sale page), a sort order controlling slide sequence, and an optional badge overlay (its own label text and color, like \"NEW\" or \"SALE\"). Banners can be switched active/inactive without deleting them, and a new one is automatically placed at the end of the slide order unless a specific position is given.",
    notes: '',
  },
  {
    title: 'WhatsApp Broadcast',
    description:
      "Admin composes one message and sends it either to every customer who has a phone number on file, or to a single named customer. A broadcast to \"all\" runs in the background — the admin gets an immediate response with the recipient count while sending continues — and personalizes the message per recipient by replacing {name} with that customer's actual name. If some sends fail, the log records whether the whole broadcast succeeded, partially failed, or failed entirely. Every send, bulk or individual, is written to a log (message, template name, sender, status) reviewable in the admin panel. This same sending path is what powers the automated Birthday Campaign underneath.",
    notes: '[Built] Needs live WhatsApp Business API credentials configured before it will actually send anything.',
  },
  {
    title: 'Birthday Campaign',
    description:
      "Every day, the system looks up customers whose date of birth falls within the next 7 days (including today) and lists them in the admin panel split into \"today\" and \"upcoming\" (with days-until and current age shown for each). Admin can send an individual birthday WhatsApp message on demand, or trigger \"send to all today\" which queues messages in the background to everyone whose birthday is literally today. The message uses an editable template with {name} and {discount} placeholders — the default wishes them a happy birthday and mentions a discount percentage (15% by default) that applies automatically at checkout, no coupon needed. Every send is logged exactly like a manual WhatsApp broadcast.",
    notes: '',
  },
  {
    title: 'Combos (Product Bundles)',
    description:
      "Admin builds a bundle of specific products sold together at one combo price and offer price, with its own dedicated stock count that's tracked independently of each individual product's own stock. A shopper buys the whole bundle as a single line item rather than adding each piece separately.",
    notes: '[Partial] Available in the admin panel and mobile app; no web storefront screen for browsing or buying a combo yet.',
  },
  {
    title: 'Free Shipping Nudge',
    description:
      'A message shown in the cart telling the shopper how much more to add to their order to unlock free shipping, nudging them toward a bigger basket before they check out.',
    notes: '[Partial] Implemented in the mobile app cart screen only (a Rs.500 threshold has been seen there); not confirmed as present on the web storefront -- likely a mobile-only nudge for now.',
  },
];

const run = async () => {
  try {
    await connectDB();
    let updated = 0;
    for (const { title, description, notes } of UPDATES) {
      const res = await Feature.updateOne(
        { title, category: 'Marketing & Engagement' },
        { $set: { description, notes } }
      );
      if (res.matchedCount > 0) {
        updated += 1;
        console.log(`Updated: ${title}`);
      } else {
        console.log(`Not found (skipped): ${title}`);
      }
    }
    console.log(`Done. ${updated}/${UPDATES.length} Marketing & Engagement features enriched.`);
  } catch (err) {
    console.error('Update failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
