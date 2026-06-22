import CallToAction from "@/Components/CallToAction";
import ChooseUs from "@/Components/ChooseUs";
import Footer from "@/Components/Footer";
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
    <Footer></Footer>
    </>
  );
}
