import SiteLayout from "@/components/layout/SiteLayout";
import Hero from "@/components/home/Hero";
import Features from "@/components/home/Features";
import LoanTypes from "@/components/home/LoanTypes";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";
import Testimonials from "@/components/home/Testimonials";

export default function HomePage() {
  return (
    <SiteLayout>
      <Hero />
      <Features />
      <LoanTypes />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </SiteLayout>
  );
} 