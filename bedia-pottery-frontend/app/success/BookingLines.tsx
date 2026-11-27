import type { BookingDetails, OrderItem } from "@/services/order.service";
import { describeFamilyLine, isFamilyLine } from "@/utils/familyParty";

/**
 * Every line of one booking on the "payment successful" page. It used to print only
 * the first line, so a booking with several clays showed one of them while the totals
 * covered all of them. A Family line says whether it is for the wheel or for
 * handbuilding and how many adults and kids come; its price is for the whole party,
 * so no per-guest price is shown.
 */
function LineDetails({ line, currency }: { line: OrderItem; currency: string }) {
  if (isFamilyLine(line)) {
    return <p>{describeFamilyLine(line)}</p>;
  }
  return (
    <>
      {(line.wheelPottery ?? 0) > 0 && (
        <p>
          {line.wheelPottery} x Wheel Pottery
          <span className="ml-1 text-black">
            {currency} {Number(line.price ?? 0).toFixed(2)}
          </span>
        </p>
      )}
      {(line.handBuild ?? 0) > 0 && (
        <p>
          {line.handBuild} x Handbuilding
          <span className="ml-1 text-black">
            {currency} {Number(line.price ?? 0).toFixed(2)}
          </span>
        </p>
      )}
      <p>
        {line.people} x{" "}
        <span className="text-black">
          {currency} {Number(line.price ?? 0).toFixed(2)}
        </span>
      </p>
    </>
  );
}

export function BookingLines({
  booking,
  variant,
}: {
  booking: BookingDetails;
  variant: "desktop" | "mobile";
}) {
  const lines = booking.items ?? [];
  const title = booking.workshopId.title;

  if (variant === "mobile") {
    return (
      <div className="space-y-3">
        {lines.map((line, i) => (
          <div key={i}>
            <h3 className="font-semibold text-[15px] text-black mb-2 leading-tight">
              {title}-{line.optionTitle}
            </h3>
            <div className="flex justify-between xl:items-center items-end text-gray-500 flex-col">
              <LineDetails line={line} currency={booking.currency} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex-grow flex flex-col justify-between w-full gap-4">
      {lines.map((line, i) => (
        <div className="flex items-start" key={i}>
          <div className="w-5/12">
            <h3 className="font-normal text-black text-[15px]">
              {title}-{line.optionTitle}
            </h3>
          </div>
          <div className="w-7/12 flex justify-between items-start">
            <div className="text-sm text-gray-500 space-y-1">
              <LineDetails line={line} currency={booking.currency} />
            </div>
            <p>
              <span className="ml-1 text-gray-500">
                {booking.currency} {Number(line.subtotal ?? 0).toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
