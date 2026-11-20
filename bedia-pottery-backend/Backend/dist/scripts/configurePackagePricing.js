"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Write a workshop's pricing shape down as option flags — and audit what the
 * live derivation makes of every workshop.
 *
 * The family workshop's options were created as nine ordinary per-head options:
 * three base prices ("Air-Dry Clay", AED 400, "1 Adult + 1 Child") and, for each
 * clay type, an "... Extra Adult" and an "... Extra Child". Checkout multiplied
 * that base price by the head count, so Stripe charged double.
 *
 * Pricing already works without this script: an option with no pricing flags
 * has its shape read off the same text it already carries — the "1 Adult +
 * 1 Child" in priceDescription, the "Extra Adult"/"Extra Child" in the titles
 * (see utils/workshopOptionPricing.ts). This writes those facts down as flags
 * instead, so pricing stops depending on the studio's wording: reword a
 * configured option's description and it keeps charging correctly.
 *
 * Run from the Backend directory.
 *
 * See what the derivation decides for every workshop (read-only — worth doing
 * before this goes live, to be sure no other workshop's wording is read as a
 * package):
 *   npx ts-node scripts/configurePackagePricing.ts --audit
 *
 * Then, per workshop, dry run and apply:
 *   npx ts-node scripts/configurePackagePricing.ts family-pottery-workshop
 *   npx ts-node scripts/configurePackagePricing.ts family-pottery-workshop --apply
 *
 * The slug is required so this is never pointed at a workshop by accident;
 * --apply is what writes. Re-running is safe: it sets the same flags and
 * reports "no change".
 *
 * NOTE: `PUT /workshop/:id` replaces the whole options array. The repo carries
 * these flags forward for options it can match by _id or title, but an option
 * renamed in the dashboard loses them and falls back to the derivation.
 */
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const configKeys_1 = __importDefault(require("../configKeys"));
const workshopModel_1 = __importDefault(require("../workshop/models/workshopModel"));
const workshopOptionPricing_1 = require("../utils/workshopOptionPricing");
const EXTRA_ADULT_TITLE = /\bextra\s*adults?\b/i;
const EXTRA_CHILD_TITLE = /\bextra\s*(?:child(?:ren)?|kids?)\b/i;
/**
 * What runtime would decide for this option right now. Using the same function
 * the booking paths use is the point: the script only ever writes down what is
 * already being charged, so applying it can never change a price.
 */
const planFor = (option) => (0, workshopOptionPricing_1.resolveOptionShape)(option);
/**
 * The shape to force with --package-all, for a workshop whose base options do
 * not spell the included party out in `priceDescription` (so nothing can be
 * derived from them). Extras are still recognised by title; everything else
 * becomes a package covering the given party.
 */
const forcedPlanFor = (option, adults, children) => {
    const title = String(option.title ?? '');
    if (EXTRA_ADULT_TITLE.test(title)) {
        return {
            pricingMode: 'per_person',
            includedAdults: 0,
            includedChildren: 0,
            addOnRole: 'extra_adult',
        };
    }
    if (EXTRA_CHILD_TITLE.test(title)) {
        return {
            pricingMode: 'per_person',
            includedAdults: 0,
            includedChildren: 0,
            addOnRole: 'extra_child',
        };
    }
    return {
        pricingMode: 'package',
        includedAdults: adults,
        includedChildren: children,
        addOnRole: 'none',
    };
};
const describe = (option, shape) => {
    if (shape.addOnRole !== 'none')
        return `add-on (${shape.addOnRole})`;
    if (shape.pricingMode === 'package') {
        return `package, includes ${shape.includedAdults} adult + ${shape.includedChildren} child`;
    }
    return `per head × ${option.price}`;
};
const storedShape = (option) => ({
    pricingMode: option.pricingMode || 'per_person',
    includedAdults: option.includedAdults || 0,
    includedChildren: option.includedChildren || 0,
    addOnRole: option.addOnRole || 'none',
});
const sameShape = (a, b) => a.pricingMode === b.pricingMode &&
    a.includedAdults === b.includedAdults &&
    a.includedChildren === b.includedChildren &&
    a.addOnRole === b.addOnRole;
/** Read-only pass over every workshop, so nothing is a surprise once live. */
const audit = async () => {
    const workshops = await workshopModel_1.default.find({ isDeleted: false }).sort({ title: 1 });
    console.log(`${workshops.length} workshop(s)\n`);
    workshops.forEach((workshop) => {
        console.log(`${workshop.title}  [${workshop.slug}]`);
        workshop.options.forEach((option) => {
            const shape = planFor(option);
            const configured = sameShape(storedShape(option), shape) ? 'configured' : 'derived';
            console.log(`  - ${String(option.title).trim()} — AED ${option.price} — ${describe(option, shape)}` +
                ` (${configured})`);
            if (shape.pricingMode === 'package' && option.priceDescription) {
                console.log(`      from priceDescription: "${option.priceDescription}"`);
            }
        });
        console.log('');
    });
    console.log('Check that every "package" line above really is a party price. Anything\n' +
        'listed as a package by mistake should have pricingMode: "per_person" set\n' +
        'on it, or its priceDescription reworded.');
};
/**
 * Everything the server knows about the option an actual payload names, and
 * what it would charge for it. This is the first thing to run when a booking is
 * priced wrongly: it says whether the live option is being treated as a package
 * at all, and why.
 */
const explain = async (optionId) => {
    const workshop = await workshopModel_1.default.findOne({
        isDeleted: false,
        'options._id': optionId,
    });
    if (!workshop) {
        console.error(`No workshop holds an option with _id ${optionId}.`);
        console.error('Wrong database, or the option has been replaced since the payload was made.');
        return;
    }
    const option = workshop.options.find((o) => String(o._id) === String(optionId));
    const shape = planFor(option);
    console.log(`workshop:  ${workshop.title}  [${workshop.slug}]  _id ${workshop._id}`);
    console.log(`option:    ${String(option.title)}  _id ${option._id}`);
    console.log(`price:     ${option.price} ${option.currency || 'AED'}`);
    console.log(`priceDescription: ${JSON.stringify(option.priceDescription ?? null)}`);
    console.log(`clayTypeId:       ${String(option.clayTypeId ?? '—')}`);
    console.log('stored flags:     ' +
        JSON.stringify({
            pricingMode: option.pricingMode ?? null,
            includedAdults: option.includedAdults ?? null,
            includedChildren: option.includedChildren ?? null,
            addOnRole: option.addOnRole ?? null,
        }));
    console.log(`resolved:  ${describe(option, shape)}\n`);
    if (shape.pricingMode !== 'package') {
        console.log('This option is NOT treated as a package, so it is priced per head and a\n' +
            'party booking doubles. Either its priceDescription does not name both an\n' +
            'adult and a child count, or it is explicitly set to per_person. Fix with:\n' +
            `  npx ts-node scripts/configurePackagePricing.ts ${workshop.slug} ` +
            '--package-all --adults 1 --children 1 --apply\n');
    }
    console.log('what it would charge:');
    [2, 3, 4].forEach((people) => {
        try {
            const { subtotal } = (0, workshopOptionPricing_1.priceWorkshopItem)(workshop.options, { optionId, people });
            console.log(`  ${people} guests, no split:  ${subtotal} + 5% tax = ${subtotal * 1.05}`);
        }
        catch (error) {
            console.log(`  ${people} guests, no split:  refused — ${error.message}`);
        }
    });
};
const configure = async (slug, apply, forced) => {
    const workshop = await workshopModel_1.default.findOne({ slug, isDeleted: false });
    if (!workshop) {
        console.error(`No workshop found for slug "${slug}"`);
        await mongoose_1.default.disconnect();
        process.exit(1);
    }
    console.log(`${workshop.title} (${workshop.options.length} options)\n`);
    let changed = 0;
    workshop.options.forEach((option) => {
        const plan = forced ? forcedPlanFor(option, forced.adults, forced.children) : planFor(option);
        const isSame = sameShape(storedShape(option), plan);
        console.log(`  ${isSame ? '=' : '→'} ${String(option.title).trim()} — AED ${option.price} — ` +
            `${describe(option, plan)}${isSame ? ' (no change)' : ''}`);
        if (isSame)
            return;
        option.pricingMode = plan.pricingMode;
        option.includedAdults = plan.includedAdults;
        option.includedChildren = plan.includedChildren;
        option.addOnRole = plan.addOnRole;
        changed += 1;
    });
    if (!apply) {
        console.log(`\nDry run — ${changed} option(s) would change. Re-run with --apply to write.`);
    }
    else if (changed === 0) {
        console.log('\nNothing to write.');
    }
    else {
        await workshop.save();
        console.log(`\nSaved — ${changed} option(s) updated.`);
    }
};
/** `--adults 2` → 2. Falls back to the given default. */
const numberFlag = (args, name, fallback) => {
    const index = args.indexOf(name);
    if (index === -1)
        return fallback;
    const value = Number(args[index + 1]);
    return Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
};
const USAGE = [
    'Usage:',
    '  npx ts-node scripts/configurePackagePricing.ts --audit',
    '  npx ts-node scripts/configurePackagePricing.ts --explain <optionId>',
    '  npx ts-node scripts/configurePackagePricing.ts <slug> [--apply]',
    '  npx ts-node scripts/configurePackagePricing.ts <slug> --package-all' +
        ' [--adults 1] [--children 1] [--apply]',
].join('\n');
const run = async () => {
    const args = process.argv.slice(2);
    const flags = args.filter((arg) => arg.startsWith('--'));
    const explainId = args[args.indexOf('--explain') + 1];
    // Positional values only — not the values belonging to --explain/--adults/…
    const flagValues = new Set(['--explain', '--adults', '--children']
        .map((flag) => args[args.indexOf(flag) + 1])
        .filter(Boolean));
    const [slug] = args.filter((arg) => !arg.startsWith('--') && !flagValues.has(arg));
    const wantsExplain = flags.includes('--explain');
    if (wantsExplain && !explainId) {
        console.error(USAGE);
        process.exit(1);
    }
    if (!slug && !flags.includes('--audit') && !wantsExplain) {
        console.error(USAGE);
        process.exit(1);
    }
    await mongoose_1.default.connect(configKeys_1.default.DATABASE_URL);
    if (wantsExplain) {
        await explain(explainId);
    }
    else if (flags.includes('--audit')) {
        await audit();
    }
    else {
        const adults = numberFlag(args, '--adults', 1);
        const children = numberFlag(args, '--children', 1);
        const forced = flags.includes('--package-all') ? { adults, children } : undefined;
        await configure(slug, flags.includes('--apply'), forced);
    }
    await mongoose_1.default.disconnect();
};
run().catch(async (error) => {
    console.error(error);
    await mongoose_1.default.disconnect();
    process.exit(1);
});
