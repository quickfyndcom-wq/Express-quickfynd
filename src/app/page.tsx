import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { RatesTransit } from "@/components/RatesTransit";
import { Services } from "@/components/Services";
import { SupportHelp } from "@/components/SupportHelp";
import { WhoWeAre } from "@/components/WhoWeAre";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <WhoWeAre />
        <Services />
        <RatesTransit />
        <SupportHelp />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
