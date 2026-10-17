import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <section className="shell flex min-h-[70vh] flex-col items-start justify-center pb-16 pt-40">
      <p className="wide text-[clamp(4rem,12vw,9rem)] font-extrabold leading-none tracking-[-0.04em] text-line">404</p>
      <h1 className="wide mt-4 text-3xl font-bold tracking-[-0.02em]">{dict.notFound.title}</h1>
      <p className="mt-3 max-w-[48ch] text-lg leading-relaxed">{dict.notFound.body}</p>
      <Link href={`/${locale}`} className="btn btn-lg btn-volt mt-8">
        {dict.notFound.back}
      </Link>
    </section>
  );
}
