"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { checkOrderPayment } from "@/services/order.service";

const ATTEMPTS = 6;
const WAIT_MS = 5000;

/**
 * Right after payment, asks the server to check the order with Stripe, so the
 * booking is confirmed and the confirmation email goes out without waiting for
 * the server's own scheduled check. Asks a few times while the order is still
 * pending, and refreshes the page once it is paid.
 */
export function ConfirmPaymentOnSuccess({ orderId }: { orderId?: string }) {
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const run = async (attempt: number) => {
      const status = await checkOrderPayment(orderId);
      if (cancelled) return;
      if (status === "paid") {
        router.refresh();
        return;
      }
      if (status === "not-found" || attempt + 1 >= ATTEMPTS) return;
      timer = setTimeout(() => void run(attempt + 1), WAIT_MS);
    };

    void run(0);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [orderId, router]);

  return null;
}
