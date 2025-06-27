
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Menu, X, ChevronDown, Search, User, ShoppingCart, Book, Users, MapPin, Phone, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { Link, useNavigate } from 'react-router-dom';
import { NavigationMenu, NavigationMenuContent, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth'
      });
    }
    setIsMenuOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Redirection vers la page de recherche avec le terme
      console.log('Recherche:', searchQuery);
      // TODO: Implémenter la redirection vers /catalogue?search=${searchQuery}
    }
  };

  return (
    <motion.nav className={cn("fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full", isScrolled ? "bg-white shadow-lg border-b border-gray-200" : "bg-gradient-to-b from-black/80 to-transparent backdrop-blur-sm")} initial={{
      opacity: 1,
      y: 0
    }} animate={{
      opacity: 1,
      y: 0
    }}>
      <div className="w-full px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <div className={cn("flex items-center justify-center w-12 h-12 rounded-lg transition-all", isScrolled ? "bg-white shadow-md" : "bg-white/90 backdrop-blur-sm")}>
                <img 
                  src="https://www.2ie-edu.org/wp-content/uploads/2023/06/2iE-LOGO-1.png" 
                  alt="Institut 2iE Logo" 
                  className="w-8 h-8 rounded-md object-cover"
                />
              </div>
              <div className="flex flex-col">
                <span className={cn("font-bold text-lg leading-tight", isScrolled ? "text-gray-800" : "text-white")}>
                  Bibliothèque 2iE
                </span>
                <span className={cn("text-xs leading-tight", isScrolled ? "text-gray-600" : "text-gray-300")}>
                  Institut International d'Ingénierie
                </span>
              </div>
            </Link>
          </div>
          
          {/* Barre de recherche centrale - Desktop uniquement */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <Input
                type="text"
                placeholder="Rechercher des livres, auteurs, sujets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full pl-10 pr-4 py-2 rounded-full border-2 transition-all", 
                  isScrolled 
                    ? "bg-gray-50 border-gray-200 focus:border-blue-500 text-gray-800" 
                    : "bg-white/90 border-white/50 focus:border-white text-gray-800 placeholder:text-gray-600"
                )}
              />
              <Search className={cn("absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4", 
                isScrolled ? "text-gray-400" : "text-gray-600"
              )} />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-1 top-1/2 transform -translate-y-1/2 rounded-full px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Search className="w-3 h-3" />
              </Button>
            </form>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <NavigationMenu className={cn(isScrolled ? "" : "text-white")}>
              <NavigationMenuList>
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    onClick={() => navigate('/')}
                    className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" : "text-gray-100 hover:text-white bg-transparent hover:bg-white/10", "cursor-pointer")}
                  >
                    Accueil
                  </NavigationMenuLink>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(isScrolled ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" : "text-gray-100 hover:text-white bg-transparent hover:bg-white/10")}>
                    Catalogue
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px]">
                      <li>
                        <NavigationMenuLink 
                          onClick={() => navigate('/catalogue')}
                          className="block p-3 space-y-1 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="font-medium flex items-center">
                            <Search className="w-4 h-4 mr-2 text-blue-600" />
                            Recherche Avancée
                          </div>
                          <p className="text-sm text-gray-500">Trouvez des livres par titre, auteur, sujet ou ISBN</p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink 
                          onClick={() => navigate('/catalogue/nouveautes')}
                          className="block p-3 space-y-1 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="font-medium flex items-center">
                            <Book className="w-4 h-4 mr-2 text-green-600" />
                            Nouveautés
                          </div>
                          <p className="text-sm text-gray-500">Découvrez les dernières acquisitions</p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink 
                          onClick={() => navigate('/catalogue/categories')}
                          className="block p-3 space-y-1 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="font-medium flex items-center">
                            <Book className="w-4 h-4 mr-2 text-purple-600" />
                            Catégories
                          </div>
                          <p className="text-sm text-gray-500">Explorez par domaines d'études</p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuTrigger className={cn(isScrolled ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" : "text-gray-100 hover:text-white bg-transparent hover:bg-white/10")}>
                    Services
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid gap-3 p-4 w-[400px]">
                      <li>
                        <NavigationMenuLink 
                          onClick={() => navigate('/services/espaces')}
                          className="block p-3 space-y-1 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="font-medium flex items-center">
                            <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                            Espaces d'Étude
                          </div>
                          <p className="text-sm text-gray-500">Salles de lecture, espaces collaboratifs</p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink 
                          onClick={() => navigate('/services/numeriques')}
                          className="block p-3 space-y-1 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="font-medium flex items-center">
                            <Book className="w-4 h-4 mr-2 text-green-600" />
                            Ressources Numériques
                          </div>
                          <p className="text-sm text-gray-500">E-books, bases de données, articles</p>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <NavigationMenuLink 
                          onClick={() => navigate('/services/formation')}
                          className="block p-3 space-y-1 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <div className="font-medium flex items-center">
                            <Users className="w-4 h-4 mr-2 text-purple-600" />
                            Formation
                          </div>
                          <p className="text-sm text-gray-500">Ateliers de recherche documentaire</p>
                        </NavigationMenuLink>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                
                <NavigationMenuItem>
                  <NavigationMenuLink 
                    onClick={() => navigate('/about')}
                    className={cn(navigationMenuTriggerStyle(), isScrolled ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" : "text-gray-100 hover:text-white bg-transparent hover:bg-white/10", "cursor-pointer")}
                  >
                    À Propos
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
            
            {/* Actions utilisateur */}
            <div className="flex items-center space-x-2 ml-4">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/panier')}
                className={cn("relative", isScrolled ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" : "text-gray-100 hover:text-white hover:bg-white/10")}
              >
                <ShoppingCart className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">3</span>
              </Button>

              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/mes-emprunts')}
                className={cn("flex items-center", isScrolled ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" : "text-gray-100 hover:text-white hover:bg-white/10")}
              >
                <Book className="w-4 h-4 mr-2" />
                Mes Emprunts
              </Button>

              
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/profil')}
                className={cn(isScrolled ? "text-gray-700 hover:text-blue-600 hover:bg-blue-50" : "text-gray-100 hover:text-white hover:bg-white/10")}
              >
                <User className="w-4 h-4 mr-2" />
                Mon Compte
              </Button>
              
              {/* <Button 
                size="sm" 
                className={cn("ml-2", isScrolled ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white text-blue-600 hover:bg-gray-100")}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Connexion
              </Button> */}
            </div>
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className={cn("focus:outline-none", isScrolled ? "text-gray-700" : "text-white")}>
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={cn("md:hidden transition-all duration-300 overflow-hidden w-full", isMenuOpen ? "max-h-[600px] opacity-100" : "max-h-0 opacity-0")}>
        <div className={cn("px-4 pt-4 pb-6 space-y-3", isScrolled ? "bg-white border-t" : "bg-black/95 backdrop-blur-sm")}>
          
          {/* Barre de recherche mobile */}
          <div className="mb-4">
            <form onSubmit={handleSearch} className="relative">
              <Input
                type="text"
                placeholder="Rechercher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn("w-full pl-10 pr-12 py-3 rounded-lg", 
                  isScrolled 
                    ? "bg-gray-50 border-gray-200 focus:border-blue-500" 
                    : "bg-white/90 border-white/50 focus:border-white text-gray-800"
                )}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Button 
                type="submit" 
                size="sm" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700 text-white px-3"
              >
                <Search className="w-3 h-3" />
              </Button>
            </form>
          </div>

          {/* Navigation Links */}
          <button 
            onClick={() => {
              navigate('/');
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
            className={cn("flex w-full items-center px-3 py-3 rounded-lg font-medium", isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-200 hover:bg-white/10 hover:text-white")}
          >
            <Book className="w-4 h-4 mr-3" />
            Accueil
          </button>
          
          {/* Catalogue Dropdown */}
          <div className="block">
            <button onClick={e => {
              e.preventDefault();
              const submenu = e.currentTarget.nextElementSibling;
              if (submenu) {
                submenu.classList.toggle('hidden');
              }
            }} className={cn("flex w-full justify-between items-center px-3 py-3 rounded-lg font-medium", isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-200 hover:bg-white/10 hover:text-white")}>
              <div className="flex items-center">
                <Search className="w-4 h-4 mr-3" />
                <span>Catalogue</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <div className="hidden ml-6 mt-2 space-y-2">
              <button 
                onClick={() => {
                  navigate('/catalogue');
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={cn("block w-full text-left px-3 py-2 rounded-md text-sm", isScrolled ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 hover:bg-white/10 hover:text-white")}
              >
                Recherche Avancée
              </button>
              <button 
                onClick={() => {
                  navigate('/catalogue/nouveautes');
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={cn("block w-full text-left px-3 py-2 rounded-md text-sm", isScrolled ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 hover:bg-white/10 hover:text-white")}
              >
                Nouveautés
              </button>
              <button 
                onClick={() => {
                  navigate('/catalogue/categories');
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={cn("block w-full text-left px-3 py-2 rounded-md text-sm", isScrolled ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 hover:bg-white/10 hover:text-white")}
              >
                Catégories
              </button>
            </div>
          </div>
          
          {/* Services Dropdown */}
          <div className="block">
            <button onClick={e => {
              e.preventDefault();
              const submenu = e.currentTarget.nextElementSibling;
              if (submenu) {
                submenu.classList.toggle('hidden');
              }
            }} className={cn("flex w-full justify-between items-center px-3 py-3 rounded-lg font-medium", isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-200 hover:bg-white/10 hover:text-white")}>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-3" />
                <span>Services</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
            
            <div className="hidden ml-6 mt-2 space-y-2">
              <button 
                onClick={() => {
                  navigate('/services/espaces');
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={cn("block w-full text-left px-3 py-2 rounded-md text-sm", isScrolled ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 hover:bg-white/10 hover:text-white")}
              >
                Espaces d'Étude
              </button>
              <button 
                onClick={() => {
                  navigate('/services/numeriques');
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={cn("block w-full text-left px-3 py-2 rounded-md text-sm", isScrolled ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 hover:bg-white/10 hover:text-white")}
              >
                Ressources Numériques
              </button>
              <button 
                onClick={() => {
                  navigate('/services/formation');
                  setIsMenuOpen(false);
                  window.scrollTo(0, 0);
                }}
                className={cn("block w-full text-left px-3 py-2 rounded-md text-sm", isScrolled ? "text-gray-600 hover:bg-blue-50 hover:text-blue-600" : "text-gray-300 hover:bg-white/10 hover:text-white")}
              >
                Formation
              </button>
            </div>
          </div>
          
          <button 
            onClick={() => {
              navigate('/about');
              setIsMenuOpen(false);
              window.scrollTo(0, 0);
            }}
            className={cn("flex w-full items-center px-3 py-3 rounded-lg font-medium", isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-200 hover:bg-white/10 hover:text-white")}
          >
            <MapPin className="w-4 h-4 mr-3" />
            À Propos
          </button>
          
          {/* Divider */}
          <hr className={cn("my-4", isScrolled ? "border-gray-200" : "border-white/20")} />
          
          {/* User Actions */}
          <div className="space-y-2">
            <button 
              onClick={() => {
                navigate('/panier');
                setIsMenuOpen(false);
              }}
              className={cn("flex w-full items-center px-3 py-3 rounded-lg font-medium", isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-200 hover:bg-white/10 hover:text-white")}
            >
              <ShoppingCart className="w-4 h-4 mr-3" />
              Panier (3)
            </button>
            

            
            <button 
              onClick={() => {
                navigate('/profil');
                setIsMenuOpen(false);
              }}
              className={cn("flex w-full items-center px-3 py-3 rounded-lg font-medium", isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-200 hover:bg-white/10 hover:text-white")}
            >
              <User className="w-4 h-4 mr-3" />
              Mon Compte
            </button>
            
            <Button 
              onClick={() => {
                navigate('/login');
                setIsMenuOpen(false);
              }}
              className={cn("w-full justify-start", isScrolled ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-white text-blue-600 hover:bg-gray-100")}
            >
              <LogIn className="w-4 h-4 mr-3" />
              Connexion
            </Button>
          </div>
          
          {/* Contact Info */}
          <div className={cn("mt-6 pt-4 border-t", isScrolled ? "border-gray-200" : "border-white/20")}>
            <button 
              onClick={() => scrollToSection('contact')} 
              className={cn("flex w-full items-center px-3 py-3 rounded-lg font-medium", isScrolled ? "text-gray-700 hover:bg-blue-50 hover:text-blue-600" : "text-gray-200 hover:bg-white/10 hover:text-white")}
            >
              <Phone className="w-4 h-4 mr-3" />
              Contact
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
