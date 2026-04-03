import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AboutSection from './components/AboutSection';
import SkillsSection from './components/SkillsSection';
import ExperienceSection from './components/ExperienceSection';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';

export default function App() {
  return (
    <>
      <Navbar />
      <main id="main-content">
        <HeroSection />
        <div className="mg-section-divide" />
        <AboutSection />
        <div className="mg-section-divide" />
        <SkillsSection />
        <div className="mg-section-divide" />
        <ExperienceSection />
        <div className="mg-section-divide" />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}