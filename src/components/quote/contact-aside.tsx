import { MessageCircle, Phone } from "lucide-react";
import { telHref, whatsappHref } from "@/lib/contact";

type Props = {
  title: string;
  body: string;
  phone: string;
  whatsapp: string;
  whatsappLabel: string;
  newTabLabel: string;
};

/** "Prefer to talk?" block shown next to the quote form. */
export function ContactAside({ title, body, phone, whatsapp, whatsappLabel, newTabLabel }: Props) {
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-white p-6">
      <p className="font-semibold text-ink">{title}</p>
      <p className="mt-2 text-[0.9375rem] leading-relaxed">{body}</p>
      <div className="mt-5 grid gap-2">
        <a href={telHref(phone)} className="btn justify-start border border-line bg-mist text-ink tabular-nums hover:border-ink/30">
          <Phone aria-hidden className="size-4 text-crimson" />
          {phone}
        </a>
        <a
          href={whatsappHref(whatsapp)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn justify-start border border-line bg-mist text-ink hover:border-ink/30"
        >
          <MessageCircle aria-hidden className="size-4 text-crimson" />
          {whatsappLabel}
          <span className="sr-only">{newTabLabel}</span>
        </a>
      </div>
    </div>
  );
}
