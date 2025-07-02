
import PageLayout from '@/components/PageLayout';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import Projects from '@/components/Projects';
import WhyELibrary from '@/components/WhyWrlds';
import BlogPreview from '@/components/BlogPreview';
import SEO from '@/components/SEO';
import { useEffect } from 'react';

const Index = () => {
  // Fix any ID conflicts when the page loads
  useEffect(() => {
    const contactElements = document.querySelectorAll('[id="contact"]');
    if (contactElements.length > 1) {
      // If there are multiple elements with id="contact", rename one
      contactElements[1].id = 'contact-footer';
    }
  }, []);

  return (
    <PageLayout showContact={false}>
      <SEO 
        title="Bibliothèque Moderne - Système de Gestion Numérique" 
        description="Découvrez notre bibliothèque moderne avec catalogue numérique, système d'emprunt intelligent et services en ligne pour tous vos besoins de lecture et recherche."
        imageUrl="/lovable-uploads/48e540e5-6a25-44e4-b3f7-80f3bfc2777a.png"
        keywords={['bibliothèque', 'catalogue numérique', 'emprunt de livres', 'gestion bibliothèque', 'recherche documentaire', 'ressources numériques', 'lecture']}
      />
      <Hero />
      <Features />
      <WhyELibrary />
      <Projects />
      <BlogPreview />
    </PageLayout>
  );
};

export default Index;
