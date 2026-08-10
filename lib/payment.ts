// Single source of truth for the payment destination, shown on the registration
// review step and the "submit again" (resubmit) page.
export const PAYMENT_INFO = {
  bank: "SeaBank",
  accountNumber: "901922476839",
  accountHolder: "Carlos Adrian Maruli Sinaga",
} as const;

// "Rp 150.000". Rupiah has no practical minor unit, so no decimals.
const idr = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export const formatIDR = (amount: number) => idr.format(amount);
