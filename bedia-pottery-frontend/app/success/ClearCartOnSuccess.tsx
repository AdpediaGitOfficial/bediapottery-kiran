'use client';

import { useEffect } from 'react';
import { useGuestCartStore } from '@/store/guestCartStore';
import { clearCheckoutKey } from '@/utils/checkoutKey';

export function ClearCartOnSuccess() {
  useEffect(() => {
    useGuestCartStore.getState().clearCart();
    // The payment went through; the next checkout is a new one.
    clearCheckoutKey();
  }, []);

  return null;
}