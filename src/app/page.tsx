import { Day } from "@/components/sections/day";
import { Faq } from "@/components/sections/faq";
import { Features } from "@/components/sections/features";
import { FinalCta, Footer } from "@/components/sections/closing";
import { Header } from "@/components/sections/header";
import { Hero } from "@/components/sections/hero";
import { Inside } from "@/components/sections/inside";
import { Pricing } from "@/components/sections/pricing";

export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="bg-sky text-sky-ink sr-only z-50 rounded-full px-4 py-2 font-semibold focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        К содержанию
      </a>
      <Header />
      <main id="main">
        <Hero />
        <Day />
        <Features />
        <Inside />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}
