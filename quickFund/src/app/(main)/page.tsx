import SiteLayout from "@/components/layout/SiteLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import HowItWorks from "@/components/home/HowItWorks";
import LoanTypes from "@/components/home/LoanTypes";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Features />
      <HowItWorks />
      <LoanTypes />
      <Testimonials />
      <CTA />
    </SiteLayout>
  );
}
