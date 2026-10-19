/** "+509 2816 0422" → "tel:+50928160422" */
export function telHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}

/** "+509 2816 0422" → "https://wa.me/50928160422" */
export function whatsappHref(phone: string): string {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}
