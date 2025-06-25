import { useState, useRef, useEffect, TouchEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, ChevronLeft, ChevronRight, Book, Star, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useIsMobile } from "@/hooks/use-mobile";

const booksCatalog = [
  {
    id: 1,
    title: "L'Art de la Programmation",
    author: "Donald E. Knuth",
    category: "Informatique",
    description: "Une série emblématique sur les algorithmes et la programmation, considérée comme la référence absolue dans le domaine.",
    tags: ["Programmation", "Algorithmes", "Informatique", "Référence"],
    imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=300&fit=crop",
    isFeatured: true,
    isbn: "978-0-201-89683-1",
    availability: "Disponible",
    rating: 4.8,
    pages: 672,
    details: `
      Cette série légendaire de Donald Knuth est considérée comme l'œuvre de référence en informatique théorique. 
      Elle couvre de manière exhaustive les algorithmes fondamentaux, les structures de données et l'analyse mathématique 
      des programmes. Un incontournable pour tout étudiant ou professionnel en informatique.
    `
  },
  {
    id: 2,
    title: "Sapiens : Une brève histoire de l'humanité",
    author: "Yuval Noah Harari",
    category: "Histoire",
    description: "Une analyse fascinante de l'évolution de l'humanité, de la révolution cognitive à l'ère moderne.",
    tags: ["Histoire", "Anthropologie", "Société", "Best-seller"],
    imageUrl: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    isbn: "978-2-226-25701-4",
    availability: "Emprunté",
    rating: 4.6,
    pages: 512
  },
  {
    id: 3,
    title: "Le Petit Prince",
    author: "Antoine de Saint-Exupéry",
    category: "Littérature",
    description: "Un conte poétique et philosophique intemporel qui touche petits et grands par sa simplicité et sa profondeur.",
    tags: ["Littérature", "Classique", "Philosophie", "Jeunesse"],
    imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    isbn: "978-2-07-040850-7",
    availability: "Disponible",
    rating: 4.9,
    pages: 96
  },
  {
    id: 4,
    title: "Introduction à l'Intelligence Artificielle",
    author: "Stuart Russell & Peter Norvig",
    category: "Sciences & Techniques",
    description: "Le manuel de référence pour comprendre les concepts fondamentaux de l'intelligence artificielle moderne.",
    tags: ["IA", "Machine Learning", "Sciences", "Techniques"],
    imageUrl: "https://images.unsplash.com/photo-1555116505-38e9ac22fe5d?w=400&h=300&fit=crop",
    isbn: "978-0-13-604259-4",
    availability: "Réservé",
    rating: 4.7,
    pages: 1152
  },
  {
    id: 5,
    title: "Les Misérables",
    author: "Victor Hugo",
    category: "Littérature Classique",
    description: "Chef-d'œuvre de la littérature française, une fresque sociale et historique du XIXe siècle.",
    tags: ["Littérature", "Classique", "Histoire", "Roman"],
    imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
    isbn: "978-2-07-041119-4",
    availability: "Disponible",
    rating: 4.5,
    pages: 1664
  }
];

const Projects = () => {
  const [activeBook, setActiveBook] = useState(0);
  const catalogRef = useRef<HTMLDivElement>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const isMobile = useIsMobile();

  const minSwipeDistance = 50;

  useEffect(() => {
    if (isInView && !isHovering) {
      const interval = setInterval(() => {
        setActiveBook(prev => (prev + 1) % booksCatalog.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering]);
  
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setIsInView(true);
      } else {
        setIsInView(false);
      }
    }, {
      threshold: 0.2
    });
    
    if (catalogRef.current) {
      observer.observe(catalogRef.current);
    }
    
    return () => observer.disconnect();
  }, []);

  const onTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      setActiveBook(prev => (prev + 1) % booksCatalog.length);
    } else if (isRightSwipe) {
      setActiveBook(prev => (prev - 1 + booksCatalog.length) % booksCatalog.length);
    }
  };

  const getCardAnimationClass = (index: number) => {
    if (index === activeBook) return "scale-100 opacity-100 z-20";
    if (index === (activeBook + 1) % booksCatalog.length) return "translate-x-[40%] scale-95 opacity-60 z-10";
    if (index === (activeBook - 1 + booksCatalog.length) % booksCatalog.length) return "translate-x-[-40%] scale-95 opacity-60 z-10";
    return "scale-90 opacity-0";
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Disponible": return "text-green-600 bg-green-50";
      case "Emprunté": return "text-red-600 bg-red-50";
      case "Réservé": return "text-orange-600 bg-orange-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };
  
  return <section id="catalog" ref={catalogRef} className="bg-white py-[50px] w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className={`text-center mb-10 max-w-3xl mx-auto transition-all duration-1000 ${isInView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="inline-block mb-2 px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm font-medium">
            Catalogue de Livres
          </div>
          <h2 className="text-3xl font-bold mb-3">
            Découvrez Notre Collection
          </h2>
          <p className="text-gray-600">
            Explorez notre vaste catalogue de livres soigneusement sélectionnés, allant des classiques intemporels aux dernières nouveautés dans tous les domaines.
          </p>
          {isMobile && (
            <div className="flex items-center justify-center mt-4 animate-pulse-slow">
              <div className="flex items-center text-blue-500">
                <ChevronLeft size={16} />
                <p className="text-sm mx-1">Glissez pour naviguer</p>
                <ChevronRight size={16} />
              </div>
            </div>
          )}
        </div>
        
        <div 
          className="relative h-[600px] overflow-hidden" 
          onMouseEnter={() => setIsHovering(true)} 
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            {booksCatalog.map((book, index) => (
              <div 
                key={book.id} 
                className={`absolute top-0 w-full max-w-md transform transition-all duration-500 ${getCardAnimationClass(index)}`} 
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <Card className="overflow-hidden h-[550px] border border-gray-100 shadow-sm hover:shadow-md flex flex-col">
                  <div 
                    className="relative bg-black p-6 flex items-center justify-center h-48 overflow-hidden"
                    style={{
                      backgroundImage: `url(${book.imageUrl})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    <div className="absolute inset-0 bg-black/50"></div>
                    <div className="relative z-10 flex flex-col items-center justify-center text-center">
                      <div className="flex items-center mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(book.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                        <span className="text-white ml-2 text-sm">({book.rating})</span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">{book.title}</h3>
                      <p className="text-white/90 text-sm font-medium">{book.author}</p>
                      <div className="w-12 h-1 bg-white mt-2"></div>
                    </div>
                  </div>
                  
                  <CardContent className="p-6 flex flex-col flex-grow">
                    <div className="mb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <p className="text-gray-500 text-sm font-medium">{book.category}</p>
                          <p className="text-xs text-gray-400 mt-1">ISBN: {book.isbn}</p>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(book.availability)}`}>
                          {book.availability}
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 flex-grow line-clamp-3">{book.description}</p>
                    
                    <div className="mt-auto">
                      <div className="flex items-center justify-between mb-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <Book className="w-4 h-4 mr-1" />
                          <span>{book.pages} pages</span>
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>Populaire</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {book.tags.slice(0, 3).map((tag, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-gray-50 text-gray-600 rounded-full text-xs animate-pulse-slow" 
                            style={{ animationDelay: `${idx * 300}ms` }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex gap-2">
                        <button 
                          className={`flex-1 py-2 px-3 rounded text-sm font-medium transition-colors ${
                            book.availability === 'Disponible' 
                              ? 'bg-blue-500 text-white hover:bg-blue-600' 
                              : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          }`}
                          disabled={book.availability !== 'Disponible'}
                        >
                          {book.availability === 'Disponible' ? 'Emprunter' : book.availability}
                        </button>
                        <button className="px-3 py-2 border border-gray-200 rounded text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                          <Clock className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
          
          {!isMobile && (
            <>
              <button 
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all duration-300 hover:scale-110" 
                onClick={() => setActiveBook(prev => (prev - 1 + booksCatalog.length) % booksCatalog.length)}
                aria-label="Livre précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button 
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center text-gray-500 hover:bg-white z-30 shadow-md transition-all duration-300 hover:scale-110" 
                onClick={() => setActiveBook(prev => (prev + 1) % booksCatalog.length)}
                aria-label="Livre suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center space-x-3 z-30">
            {booksCatalog.map((_, idx) => (
              <button 
                key={idx} 
                className={`w-2 h-2 rounded-full transition-all duration-300 ${activeBook === idx ? 'bg-gray-500 w-5' : 'bg-gray-200 hover:bg-gray-300'}`} 
                onClick={() => setActiveBook(idx)}
                aria-label={`Aller au livre ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className="text-center mt-8">
          <Link 
            to="/catalog" 
            className="inline-flex items-center px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg group"
          >
            Voir Tout le Catalogue
            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>;
};

export default Projects;
