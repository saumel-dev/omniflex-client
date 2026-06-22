import CallToAction from "@/Components/CallToAction";
import ChooseUs from "@/Components/ChooseUs";
import Hero from "@/Components/Hero";
import MacroCalculatorForm from "@/Components/MacroCalculatorForm";
import MacroSection from "@/Components/MacroSection";
import Navbar from "@/Components/Navbar";
import Image from "next/image";

export default function Home() {
  return (
    <>
    <Hero></Hero>
    <ChooseUs></ChooseUs>
    <MacroSection></MacroSection>
    <CallToAction></CallToAction>
    </>
  );
}
