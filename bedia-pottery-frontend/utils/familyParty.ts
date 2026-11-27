/**
 * A Family Pottery Workshop line is a party of adults and kids, made by wheel or by
 * handbuilding. These turn the saved counts into the words the cart, the success
 * page and the confirmation email all use.
 */

const count = (value?: number | null) => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
};

/** True when a line carries adult or kid counts, i.e. it is a Family line. */
export function isFamilyLine(line: { adult?: number | null; child?: number | null }) {
  return count(line.adult) + count(line.child) > 0;
}

/** "2 Adults, 1 Kid" */
export function describeFamilyParty(adult?: number | null, child?: number | null) {
  const adults = count(adult);
  const kids = count(child);
  const parts: string[] = [];
  if (adults > 0) parts.push(`${adults} ${adults === 1 ? "Adult" : "Adults"}`);
  if (kids > 0) parts.push(`${kids} ${kids === 1 ? "Kid" : "Kids"}`);
  return parts.join(", ");
}

/** "Wheel", "Handbuilding", or empty when the line does not say. */
export function describeMakingType(wheel?: number | null, hand?: number | null) {
  const onWheel = count(wheel) > 0;
  const byHand = count(hand) > 0;
  if (onWheel && byHand) return "Wheel and Handbuilding";
  if (onWheel) return "Wheel";
  if (byHand) return "Handbuilding";
  return "";
}

/** "Wheel · 2 Adults, 1 Kid" */
export function describeFamilyLine(line: {
  adult?: number | null;
  child?: number | null;
  wheelPottery?: number | null;
  handBuild?: number | null;
}) {
  return [
    describeMakingType(line.wheelPottery, line.handBuild),
    describeFamilyParty(line.adult, line.child),
  ]
    .filter(Boolean)
    .join(" · ");
}
