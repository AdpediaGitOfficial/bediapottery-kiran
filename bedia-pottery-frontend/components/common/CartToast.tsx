"use client";

import { useEffect } from "react";
import Link from "next/link";

interface CartToastProps {
  message?: string;
  onClose: () => void;
}

/** How long the message stays on screen. */
const VISIBLE_MS = 5000;

/**
 * Confirms that something was added to the bag: a small card in the top-right
 * corner, under the header, with a way to open the bag or go straight to
 * checkout. It closes by itself, or with the x. The page does not need to move.
 *
 * Render it with a new `key` for every add, so the timer starts again.
 */
export default function CartToast({
  message = "Added to your bag",
  onClose,
}: CartToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 top-20 z-[9999] w-[calc(100vw-2rem)] max-w-[340px] border border-[#0D463D]/20 bg-white p-4 shadow-lg animate-in fade-in slide-in-from-top duration-300 sm:right-6"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="flex items-center gap-2 text-sm font-semibold text-[#0D463D]">
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            className="h-5 w-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="10" cy="10" r="8.5" />
            <path d="M6 10.5l2.8 2.8L14 7.8" />
          </svg>
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="-mr-1 -mt-1 px-1 text-xl leading-none text-gray-500 hover:text-gray-800"
        >
          &times;
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Link
          href="/cart"
          className="border border-[#0D463D] px-3 py-2 text-center text-sm font-medium text-[#0D463D] hover:bg-[#0D463D]/5"
        >
          View bag
        </Link>
        <Link
          href="/checkout"
          className="bg-[#0D463D] px-3 py-2 text-center text-sm font-medium text-white hover:opacity-90"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
}
