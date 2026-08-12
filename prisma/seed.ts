/**
 * Seed script — run with: npm run db:seed
 * Idempotent: safe to re-run (uses upsert on natural keys).
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { BRAND_SEED } from '../src/lib/seo/product-seo';

// tsx does not auto-load .env the way the Prisma CLI does, so load it here.
// Without this the seed fails with "Environment variable not found: DATABASE_URL".
if (!process.env.DATABASE_URL) {
  try {
    readFileSync(resolve(process.cwd(), '.env'), 'utf8')
      .split('\n')
      .forEach((line) => {
        const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
        if (m && !process.env[m[1]]) {
          process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
        }
      });
  } catch {
    /* .env is optional when vars come from the shell */
  }
}

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Aqua Perl…');

  /* ── Admin user ── */
  const admin = await prisma.user.upsert({
    where: { phone: '8969821440' },
    update: { role: 'SUPER_ADMIN' },
    create: {
      phone: '8969821440',
      fullName: 'Aqua Perl Admin',
      email: 'admin@rokadoctor.in',
      passwordHash: await bcrypt.hash('ChangeMe@123', 12),
      role: 'SUPER_ADMIN',
      phoneVerifiedAt: new Date(),
    },
  });
  console.log('  ✓ admin user (login: 8969821440 / ChangeMe@123)');

  /* ── Pincodes — CRITICAL: without these the Patna service gate fails ──
     The pincode table drives:
       • "Book Service" eligibility on the booking form
       • visit charge shown to the customer
       • delivery ETA + COD availability on every PDP
     Missing rows silently fall back to "service not available", which would
     turn away real Patna customers. Always seed this. */
  const patnaPincodes = [
    '800001','800002','800003','800004','800005','800006','800007','800008',
    '800009','800010','800011','800012','800013','800014','800016','800020',
    '800023','800024','800025','800026','800027',
  ];
  for (const p of patnaPincodes) {
    await prisma.pincode.upsert({
      where: { pincode: p },
      update: { isServiceAvailable: true, visitCharge: 200 },
      create: {
        pincode: p, city: 'Patna', district: 'Patna', state: 'Bihar', zone: 'EAST',
        isServiceAvailable: true, isDeliveryAvailable: true, isCodAvailable: true,
        visitCharge: 200, standardEtaDays: 2,
      },
    });
  }
  // Greater Patna — serviceable with a higher visit charge
  for (const p of ['801503', '801505', '801506']) {
    await prisma.pincode.upsert({
      where: { pincode: p },
      update: { isServiceAvailable: true, visitCharge: 250 },
      create: {
        pincode: p, city: 'Danapur', district: 'Patna', state: 'Bihar', zone: 'EAST',
        isServiceAvailable: true, isDeliveryAvailable: true, isCodAvailable: true,
        visitCharge: 250, standardEtaDays: 3,
      },
    });
  }
  // Metro pincodes — delivery only, NO on-site service
  const metros: [string, string, string, number][] = [
    ['110001', 'New Delhi', 'Delhi', 4],
    ['400001', 'Mumbai', 'Maharashtra', 5],
    ['560001', 'Bengaluru', 'Karnataka', 5],
    ['700001', 'Kolkata', 'West Bengal', 4],
    ['600001', 'Chennai', 'Tamil Nadu', 5],
    ['500001', 'Hyderabad', 'Telangana', 5],
    ['302001', 'Jaipur', 'Rajasthan', 4],
    ['226001', 'Lucknow', 'Uttar Pradesh', 3],
    ['834001', 'Ranchi', 'Jharkhand', 3],
    ['823001', 'Gaya', 'Bihar', 2],
    ['842001', 'Muzaffarpur', 'Bihar', 2],
  ];
  for (const [pincode, city, state, eta] of metros) {
    await prisma.pincode.upsert({
      where: { pincode },
      update: {},
      create: {
        pincode, city, state, district: city,
        isServiceAvailable: false, isDeliveryAvailable: true, isCodAvailable: true,
        visitCharge: 0, standardEtaDays: eta, shippingZoneRate: 99,
      },
    });
  }
  console.log(`  ✓ ${patnaPincodes.length + 3} serviceable + ${metros.length} delivery-only pincodes`);

  /* ── Brands ──
     The full BRAND_SEED list lives in src/lib/seo/product-seo.ts so the admin
     UI and the seed can never drift apart. The 'aquanexa' slug is kept as-is
     because live products already point at that row — only the display name
     was renamed to 'Aqua Perl'. Renaming the slug would orphan those rows. */
  const brandData: { name: string; slug: string; isFeatured?: boolean }[] = [
    { name: 'Aqua Perl', slug: 'aquanexa', isFeatured: true },
    ...BRAND_SEED.filter((b) => b.slug !== 'aqua-perl'),
  ];
  const brands: Record<string, string> = {};
  for (const b of brandData) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: { name: b.name, slug: b.slug, isFeatured: b.isFeatured ?? false },
    });
    brands[b.slug] = row.id;
  }
  console.log(`  ✓ ${brandData.length} brands`);

  /* ── Categories ── */
  const catData = [
    { name: 'New RO Purifiers', slug: 'new-ro-purifiers', kind: 'NEW_RO' as const, iconKey: 'droplet', displayOrder: 1 },
    { name: 'Spare Parts', slug: 'spare-parts', kind: 'SPARE_PART' as const, iconKey: 'gear', displayOrder: 2 },
    { name: 'Commercial Plants', slug: 'commercial-plants', kind: 'COMMERCIAL_PLANT' as const, iconKey: 'factory', displayOrder: 3 },
    { name: 'RO Membranes', slug: 'ro-membranes', kind: 'SPARE_PART' as const, displayOrder: 4 },
    { name: 'Booster Pumps', slug: 'booster-pumps', kind: 'SPARE_PART' as const, displayOrder: 5 },
    { name: 'Accessories', slug: 'accessories', kind: 'ACCESSORY' as const, displayOrder: 6 },
  ];
  const cats: Record<string, string> = {};
  for (const c of catData) {
    const row = await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    cats[c.slug] = row.id;
  }
  console.log(`  ✓ ${catData.length} categories`);

  /* ── Products ── */
  const products = [
    {
      sku: 'AQN-RO-8L-001',
      slug: 'aquanexa-pure-8l-ro-uv-uf-water-purifier',
      name: 'Aqua Perl Pure 8L RO + UV + UF Water Purifier with TDS Controller',
      shortDescription: '7-stage purification with RO, UV and UF membranes plus a TDS controller that retains essential minerals. Ideal for borewell and municipal water up to 2000 ppm.',
      description: '<p>The Aqua Perl Pure 8L delivers genuinely safe drinking water through a 7-stage purification process. The RO membrane removes dissolved salts and heavy metals, UV sterilisation kills bacteria and viruses, and the UF stage traps suspended particles.</p><p>The built-in TDS controller lets you retain essential minerals like calcium and magnesium rather than stripping the water completely — a difference you can taste.</p>',
      type: 'NEW_RO' as const,
      categoryId: cats['new-ro-purifiers'],
      brandId: brands['aquanexa'],
      mrp: 11700, sellingPrice: 8499, costPrice: 5900,
      stockQuantity: 42, purificationTech: ['RO', 'UV', 'UF', 'TDS_CONTROLLER'],
      storageLitres: 8, warrantyMonths: 12,
      isFeatured: true, isBestseller: true, soldCount: 284, ratingAvg: 4.6, ratingCount: 1284,
      requiresInstallation: true, status: 'ACTIVE' as const,
      images: [
        { url: '/products/ro-domestic.png', altText: 'Aqua Perl Pure 8L RO UV UF water purifier front view', isPrimary: true },
        { url: '/products/ro-domestic.png', altText: 'Aqua Perl Pure 8L water purifier side profile', isPrimary: false },
        { url: '/products/ro-domestic.png', altText: 'Aqua Perl Pure 8L purifier filter cartridge detail', isPrimary: false },
      ],
      specs: [
        { specGroup: 'General', specKey: 'Storage Capacity', specValue: '8 Litres' },
        { specGroup: 'General', specKey: 'Mounting Type', specValue: 'Wall Mounted / Counter Top' },
        { specGroup: 'Purification', specKey: 'Stages', specValue: '7 Stage' },
        { specGroup: 'Purification', specKey: 'Max TDS Input', specValue: '2000 ppm' },
        { specGroup: 'Purification', specKey: 'Technology', specValue: 'RO + UV + UF + TDS Controller' },
        { specGroup: 'Electrical', specKey: 'Power Consumption', specValue: '36 W' },
        { specGroup: 'Electrical', specKey: 'Operating Voltage', specValue: '180–260 V AC' },
        { specGroup: 'Dimensions', specKey: 'Size (W×D×H)', specValue: '32 × 24 × 47 cm' },
      ],
    },
    {
      sku: 'AQN-RO-10L-ALK',
      slug: 'aquanexa-alkaline-copper-10l-ro-purifier',
      name: 'Aqua Perl Alkaline Copper 10L RO Purifier — Mineral Guard',
      shortDescription: 'Alkaline pH+ and copper infusion technology in a 10-litre tank. Raises water pH to 8.5–9.5 for better hydration.',
      description: '<p>Combines reverse osmosis with an alkaline cartridge and copper infusion chamber. Output water sits at pH 8.5–9.5 with trace copper, following traditional Ayurvedic practice of storing water in copper vessels.</p>',
      type: 'NEW_RO' as const,
      categoryId: cats['new-ro-purifiers'],
      brandId: brands['aquanexa'],
      mrp: 15900, sellingPrice: 12999, costPrice: 9200,
      stockQuantity: 4, lowStockThreshold: 5,
      purificationTech: ['RO', 'UV', 'ALKALINE', 'COPPER', 'MINERAL'],
      storageLitres: 10, warrantyMonths: 24,
      isFeatured: true, soldCount: 96, ratingAvg: 4.4, ratingCount: 742,
      requiresInstallation: true, status: 'ACTIVE' as const,
      images: [
        { url: '/products/ro-domestic.png', altText: 'Aqua Perl Alkaline Copper 10L RO purifier front view', isPrimary: true },
        { url: '/products/ro-domestic.png', altText: 'Aqua Perl Alkaline Copper purifier copper chamber detail', isPrimary: false },
      ],
      specs: [
        { specGroup: 'General', specKey: 'Storage Capacity', specValue: '10 Litres' },
        { specGroup: 'Purification', specKey: 'Output pH', specValue: '8.5 – 9.5' },
        { specGroup: 'Purification', specKey: 'Stages', specValue: '8 Stage' },
        { specGroup: 'Electrical', specKey: 'Power Consumption', specValue: '45 W' },
      ],
    },
    {
      sku: 'AQN-PUMP-100G',
      slug: 'ro-booster-pump-100-gpd-24v',
      name: 'RO Booster Pump 100 GPD — 24V DC with Mounting Bracket',
      shortDescription: 'Genuine 100 GPD diaphragm booster pump. Fits most domestic RO systems. Includes mounting bracket and connectors.',
      description: '<p>A reliable 24V DC diaphragm pump rated at 100 GPD, suitable for domestic RO purifiers where inlet pressure is below 40 psi. Runs quiet and ships with a mounting bracket plus quick-connect fittings.</p>',
      type: 'SPARE_PART' as const,
      categoryId: cats['booster-pumps'],
      mrp: 1999, sellingPrice: 1299, costPrice: 780,
      stockQuantity: 156, purificationTech: [],
      warrantyMonths: 6, freeShipping: false,
      isFeatured: true, isBestseller: true, soldCount: 512, ratingAvg: 4.7, ratingCount: 2051,
      status: 'ACTIVE' as const,
      images: [
        { url: '/products/ro-commercial.png', altText: 'RO booster pump 100 GPD 24V DC', isPrimary: true },
        { url: '/products/ro-commercial.png', altText: 'RO booster pump mounting bracket and connectors', isPrimary: false },
      ],
      specs: [
        { specGroup: 'General', specKey: 'Flow Rate', specValue: '100 GPD' },
        { specGroup: 'Electrical', specKey: 'Voltage', specValue: '24 V DC' },
        { specGroup: 'Electrical', specKey: 'Current', specValue: '0.8 A' },
        { specGroup: 'General', specKey: 'Inlet/Outlet', specValue: '1/4 inch quick connect' },
      ],
    },
    {
      sku: 'AQN-COM-250LPH',
      slug: 'commercial-ro-plant-250-lph',
      name: 'Commercial RO Plant 250 LPH — SS Frame with FRP Vessels',
      shortDescription: 'Industrial 250 litre-per-hour RO plant on a stainless steel frame. Suited to restaurants, schools and small water ATM operations.',
      description: '<p>A complete 250 LPH commercial reverse osmosis system built on a powder-coated stainless steel frame with FRP pressure vessels, a high-pressure multistage pump, pressure gauges and a dosing system.</p><p>Free site survey and installation included within Patna. Pan-India dispatch available with a certified installation partner.</p>',
      type: 'COMMERCIAL_PLANT' as const,
      categoryId: cats['commercial-plants'],
      brandId: brands['aquanexa'],
      mrp: 92000, sellingPrice: 78000, costPrice: 58000,
      stockQuantity: 3, purificationTech: ['RO'],
      capacityLph: 250, warrantyMonths: 12,
      isPanIndia: true, requiresInstallation: true,
      soldCount: 18, ratingAvg: 4.8, ratingCount: 96,
      status: 'ACTIVE' as const,
      images: [
        { url: '/products/ro-commercial.png', altText: 'Commercial RO plant 250 LPH stainless steel frame', isPrimary: true },
        { url: '/products/ro-commercial.png', altText: 'Commercial RO plant FRP pressure vessels and pump detail', isPrimary: false },
      ],
      specs: [
        { specGroup: 'General', specKey: 'Capacity', specValue: '250 Litres per Hour' },
        { specGroup: 'General', specKey: 'Frame Material', specValue: 'Stainless Steel 304' },
        { specGroup: 'Electrical', specKey: 'Motor', specValue: '1 HP Multistage' },
        { specGroup: 'Electrical', specKey: 'Power Supply', specValue: '220 V / 50 Hz Single Phase' },
        { specGroup: 'Purification', specKey: 'Membrane', specValue: '4040 FRP × 2' },
      ],
    },
  ];

  for (const p of products) {
    const { images, specs, ...data } = p;
    const created = await prisma.product.upsert({
      where: { sku: p.sku },
      update: { sellingPrice: p.sellingPrice, stockQuantity: p.stockQuantity },
      create: {
        ...data,
        createdBy: admin.id,
        images: { create: images.map((img, i) => ({ ...img, displayOrder: i, thumbUrl: img.url, zoomUrl: img.url })) },
        specifications: { create: specs.map((s, i) => ({ ...s, displayOrder: i })) },
      },
    });

    await prisma.seoMetadata.upsert({
      where: { entityType_entityId: { entityType: 'PRODUCT', entityId: created.id } },
      update: {},
      create: {
        entityType: 'PRODUCT',
        entityId: created.id,
        path: `/products/${p.slug}`,
        // Google truncates past ~60 chars; layout appends ' | Aqua Perl'
        metaTitle: `${p.name.length > 43 ? p.name.slice(0, 42).trimEnd() + '…' : p.name} | Buy Online`,
        metaDescription: p.shortDescription.slice(0, 152),
        metaKeywords: `${p.name}, buy ${p.name} online, ${p.name} price india`,
        updatedBy: admin.id,
      },
    });
  }
  console.log(`  ✓ ${products.length} products with images, specs and SEO`);

  /* ── Technicians ── */
  const techs = [
    { employeeCode: 'TECH-001', fullName: 'Ramesh Kumar', phone: '9876543210',
      skills: ['RO_REPAIR', 'UV', 'PLUMBING'], servicePincodes: ['800020', '800026', '800001'], ratingAvg: 4.8, jobsCompleted: 340 },
    { employeeCode: 'TECH-002', fullName: 'Sanjay Paswan', phone: '9876543211',
      skills: ['RO_REPAIR', 'COMMERCIAL_PLANT'], servicePincodes: ['800013', '800014', '800001'], ratingAvg: 4.6, jobsCompleted: 210 },
    { employeeCode: 'TECH-003', fullName: 'Imran Ali', phone: '9876543212',
      skills: ['RO_REPAIR', 'UV', 'INSTALLATION'], servicePincodes: ['800023', '800024', '800025', '801503'], ratingAvg: 4.9, jobsCompleted: 415 },
  ];
  for (const t of techs) {
    await prisma.technician.upsert({
      where: { employeeCode: t.employeeCode },
      update: {},
      create: { ...t, joinedAt: new Date('2024-01-15'), isActive: true },
    });
  }
  console.log(`  ✓ ${techs.length} technicians`);

  /* ── Coupons ── */
  await prisma.coupon.upsert({
    where: { code: 'WELCOME10' },
    update: {},
    create: {
      code: 'WELCOME10', description: '10% off your first order',
      discountType: 'PERCENT', discountValue: 10, maxDiscount: 1500,
      minOrderValue: 999, usageLimitUser: 1, isActive: true,
    },
  });
  console.log('  ✓ coupons');

  /* ── Dynamic site settings (admin-editable, no redeploy needed) ── */
  const settings: [string, object, string][] = [
    ['contact', {
      primaryPhone: '8969821440',
      secondaryPhone: '9661288308',
      tertiaryPhone: '9534037266',
      whatsapp: '918969821440',
      email: 'support@rokadoctor.in',
      hours: 'Mon–Sun 08:00–21:00',
    }, 'Public contact channels'],
    ['service', {
      visitCharge: 200,
      emergencyCharge: 299,
      responseTime: '90 minutes',
      warrantyDays: 30,
      city: 'Patna',
      state: 'Bihar',
    }, 'Local service configuration'],
    ['banner', {
      heroHeadline: 'RO Service in Patna',
      heroSubline: 'Visit Charge Only ₹200',
      heroImage: '/banners/service-tech.png',
      announcementText: 'RO Service in Patna — Visit charge only ₹200 · Same-day visit',
      announcementActive: true,
    }, 'Homepage banner content'],
  ];
  for (const [key, value, description] of settings) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as never },
      create: { key, value: value as never, description },
    });
  }
  console.log(`  ✓ ${settings.length} dynamic settings (3 phone numbers)`);

  /* ── Static page SEO ── */
  // SEO note: keep meta_title ≤ 60 chars and meta_description ≤ 155 chars,
  // otherwise Google truncates them in search results. These DB rows OVERRIDE
  // the code fallbacks, so length discipline matters most here.
  const pages = [
    /* Titles kept in the 50-60 char window (Zyppy 2026: lowest rewrite rate).
       "Water Purifier" carries a query term every competitor ranking above us
       had and we did not. */
    { path: '/', metaTitle: 'RO Service in Patna — Water Purifier Repair ₹200',
      metaDescription: 'Expert RO repair & water purifier service across Patna at ₹200 visit charge — others charge ₹350+. All brands, 90-min response, 30-day warranty. Call 8969821440.' },
    { path: '/service-patna', metaTitle: 'RO Service in Patna — Water Purifier Repair ₹200',
      metaDescription: 'RO repair, installation & AMC across Patna. ₹200 visit charge, same-day service, 30-day warranty. All brands. Call 8969821440.' },
  ];
  for (const pg of pages) {
    /* `update` stays empty on purpose: once the site is live the owner edits
       these from /admin/seo, and re-running the seed must never wipe that.
       To push a new default onto an existing row, run the SQL in
       TITLE-SEO-UPDATE.md instead. */
    await prisma.seoMetadata.upsert({
      where: { path: pg.path },
      update: {},
      create: { entityType: 'STATIC_PAGE', ...pg, updatedBy: admin.id },
    });
  }
  console.log(`  ✓ ${pages.length} static page SEO records`);

  console.log('\n✅ Seed complete.\n   Admin login → phone 8969821440 / password ChangeMe@123');
  console.log('   ⚠️  Change that password before going live.\n');
}

main()
  .catch((e) => { console.error('❌ Seed failed:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
