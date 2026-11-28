import type { CartData } from "@/services/cart.service";
import type { CheckoutPayload, GiftDetailsPayload } from "@/types";

/** The longest voucher message the server accepts. */
export const GIFT_MESSAGE_MAX_LENGTH = 250;

/**
 * What a gift line sends for its voucher: the occasion and the message the customer
 * wrote. Nothing is sent when both are empty, and the message is cut to the length
 * the server accepts, so a long one can never make the whole checkout fail.
 */
export function pickGiftDetails(
  gift?: { occasion?: string; personalMessage?: string } | null
): GiftDetailsPayload | undefined {
  if (!gift) return undefined;
  const occasion = String(gift.occasion ?? "").trim();
  const personalMessage = String(gift.personalMessage ?? "")
    .trim()
    .slice(0, GIFT_MESSAGE_MAX_LENGTH);
  if (!occasion && !personalMessage) return undefined;
  return {
    ...(occasion && { occasion }),
    ...(personalMessage && { personalMessage }),
  };
}

/**
 * The booking entries of a checkout, built from the cart. Lines for the same session
 * (workshop, date and slot) become one entry; every gift is its own entry, and
 * carries its own message, so each voucher is made with the message written for it.
 */
export function buildCheckoutWorkshops(
  data: CartData[]
): CheckoutPayload["workshops"] {
  const workshopMap = new Map<string, CheckoutPayload["workshops"][0]>();
  let giftIndex = 0;

  data.forEach((cart) => {
    cart.items.forEach((item) => {
      const isGift = item.bookingType === "gift";
      const key = isGift
        ? `gift-${giftIndex++}`
        : `${item.workshopId._id}|${item.bookingDate}|${item.slotId}`;

      const existing = workshopMap.get(key);

      const workshopItem = {
        optionId: item.optionId,
        people: item.people,
        ...(item.workshopType && { workshopType: item.workshopType }),
        ...(item.adult != null && { adult: item.adult }),
        ...(item.child != null && { child: item.child }),
        ...(item.handBuild != null && { handBuild: item.handBuild }),
        ...(item.wheelPottery != null && { wheelPottery: item.wheelPottery }),
      };

      if (existing) {
        existing.items.push(workshopItem);
      } else {
        const workshopPayload: CheckoutPayload["workshops"][0] = {
          workshopId: item.workshopId._id,
          bookingType: item.bookingType,
          items: [workshopItem],
        };

        if (isGift) {
          const giftDetails = pickGiftDetails(item.giftDetails);
          if (giftDetails) workshopPayload.giftDetails = giftDetails;
        } else {
          workshopPayload.bookingDate = item.bookingDate;
          workshopPayload.slotId = item.slotId;
        }

        workshopMap.set(key, workshopPayload);
      }
    });
  });

  return Array.from(workshopMap.values());
}
