'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Book, User, Calendar, ArrowRight, X, ChevronDown, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion } from 'framer-motion'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

interface Book {
  id: number
  title: string
  author: string
  isbn: string
  genre: string
  description: string
  total_quantity: number
  available_quantity: number
  publication_year: number
  created_at: string
}

const Catalogue = () => {
  const [books, setBooks] = useState<Book[]>([])
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGenre, setSelectedGenre] = useState('all')
  const [selectedAuthor, setSelectedAuthor] = useState('all')
  const [sortBy, setSortBy] = useState('title')
  const [loading, setLoading] = useState(true)
  const [genres, setGenres] = useState<string[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6 }
    }
  }

  // Récupération des livres depuis l'API
  useEffect(() => {
    fetchBooks()
    fetchGenres()
    fetchAuthors()
  }, [])

  const fetchBooks = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:5000/api/books')
      if (response.ok) {
        const data = await response.json()
        setBooks(data.books || data)
        setFilteredBooks(data.books || data)
      } else {
        console.error('Erreur lors de la récupération des livres')
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Données de test si l'API n'est pas disponible
      const testBooks = [
        {
          id: 1,
          title: "Introduction à l'Intelligence Artificielle",
          author: "Dr. Marie Dubois",
          isbn: "978-2-123456-78-9",
          genre: "Technologie",
          description: "Une introduction complète aux concepts fondamentaux de l'IA moderne, incluant l'apprentissage automatique et les réseaux de neurones.",
          total_quantity: 5,
          available_quantity: 3,
          publication_year: 2023,
          created_at: "2024-01-01"
        },
        {
          id: 2,
          title: "Histoire de l'Afrique Contemporaine",
          author: "Prof. Amadou Diallo",
          isbn: "978-2-987654-32-1",
          genre: "Histoire",
          description: "Un regard approfondi sur l'évolution politique, sociale et culturelle de l'Afrique au XXe et XXIe siècles.",
          total_quantity: 3,
          available_quantity: 0,
          publication_year: 2022,
          created_at: "2024-01-01"
        },
        {
          id: 3,
          title: "Mathématiques Appliquées à l'Ingénierie",
          author: "Prof. Jean-Claude Koné",
          isbn: "978-2-456789-12-3",
          genre: "Sciences",
          description: "Manuel complet de mathématiques pour les étudiants en ingénierie : calcul différentiel, algèbre linéaire et statistiques.",
          total_quantity: 8,
          available_quantity: 5,
          publication_year: 2023,
          created_at: "2024-01-01"
        },
        {
          id: 4,
          title: "Littérature Africaine Contemporaine",
          author: "Dr. Fatima Traoré",
          isbn: "978-2-789012-34-5",
          genre: "Littérature",
          description: "Une exploration de la richesse littéraire africaine moderne à travers les œuvres d'auteurs emblématiques.",
          total_quantity: 4,
          available_quantity: 2,
          publication_year: 2022,
          created_at: "2024-01-01"
        },
        {
          id: 5,
          title: "Génie Civil et Construction Durable",
          author: "Ing. Pierre Ouédraogo",
          isbn: "978-2-345678-90-1",
          genre: "Ingénierie",
          description: "Principes de construction durable et techniques modernes du génie civil adaptées au contexte africain.",
          total_quantity: 6,
          available_quantity: 4,
          publication_year: 2024,
          created_at: "2024-01-01"
        },
        {
          id: 6,
          title: "Économie du Développement en Afrique",
          author: "Dr. Awa Ndiaye",
          isbn: "978-2-678901-23-4",
          genre: "Économie",
          description: "Analyse des défis économiques contemporains et des stratégies de développement pour l'Afrique.",
          total_quantity: 5,
          available_quantity: 3,
          publication_year: 2023,
          created_at: "2024-01-01"
        },
        {
          id: 7,
          title: "Programmation Python pour Débutants",
          author: "Dr. Sarah Johnson",
          isbn: "978-2-567890-12-3",
          genre: "Informatique",
          description: "Guide pratique pour apprendre Python de A à Z avec des projets concrets et des exercices progressifs.",
          total_quantity: 10,
          available_quantity: 8,
          publication_year: 2024,
          created_at: "2024-01-01"
        },
        {
          id: 8,
          title: "Énergies Renouvelables et Développement",
          author: "Prof. Michel Sawadogo",
          isbn: "978-2-456789-01-2",
          genre: "Environnement",
          description: "Solutions énergétiques durables pour l'Afrique : solaire, éolien et biomasse.",
          total_quantity: 4,
          available_quantity: 1,
          publication_year: 2023,
          created_at: "2024-01-01"
        },
        {
          id: 9,
          title: "Chimie Organique Fondamentale",
          author: "Dr. Robert Kaboré",
          isbn: "978-2-789012-45-6",
          genre: "Sciences",
          description: "Cours complet de chimie organique avec exercices corrigés et travaux pratiques.",
          total_quantity: 7,
          available_quantity: 5,
          publication_year: 2022,
          created_at: "2024-01-01"
        },
        {
          id: 10,
          title: "Sociologie Urbaine Africaine",
          author: "Prof. Aminata Sow",
          isbn: "978-2-890123-56-7",
          genre: "Sociologie",
          description: "Étude des transformations urbaines en Afrique et de leurs impacts socioculturels.",
          total_quantity: 3,
          available_quantity: 2,
          publication_year: 2023,
          created_at: "2024-01-01"
        },
        {
          id: 11,
          title: "Mécanique des Fluides Appliquée",
          author: "Ing. David Compaoré",
          isbn: "978-2-901234-67-8",
          genre: "Ingénierie",
          description: "Principes fondamentaux de la mécanique des fluides avec applications pratiques en ingénierie.",
          total_quantity: 5,
          available_quantity: 3,
          publication_year: 2024,
          created_at: "2024-01-01"
        },
        {
          id: 12,
          title: "Marketing Digital en Afrique",
          author: "Dr. Grace Mensah",
          isbn: "978-2-012345-78-9",
          genre: "Marketing",
          description: "Stratégies de marketing numérique adaptées aux marchés africains et aux nouvelles technologies.",
          total_quantity: 6,
          available_quantity: 4,
          publication_year: 2024,
          created_at: "2024-01-01"
        }
      ]
      setBooks(testBooks)
      setFilteredBooks(testBooks)
    } finally {
      setLoading(false)
    }
  }

  const fetchGenres = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books/genres')
      if (response.ok) {
        const data = await response.json()
        setGenres(data.genres || [])
      }
    } catch (error) {
      setGenres(['Technologie', 'Histoire', 'Sciences', 'Littérature', 'Ingénierie', 'Économie', 'Informatique', 'Environnement', 'Sociologie', 'Marketing'])
    }
  }

  const fetchAuthors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/books/popular-authors')
      if (response.ok) {
        const data = await response.json()
        setAuthors(data.authors || [])
      }
    } catch (error) {
      setAuthors(['Dr. Marie Dubois', 'Prof. Amadou Diallo', 'Prof. Jean-Claude Koné', 'Dr. Fatima Traoré', 'Ing. Pierre Ouédraogo', 'Dr. Awa Ndiaye', 'Dr. Sarah Johnson', 'Prof. Michel Sawadogo'])
    }
  }

  // Recherche et filtrage
  useEffect(() => {
    let filtered = books

    if (searchTerm) {
      filtered = filtered.filter(book =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        book.isbn.includes(searchTerm)
      )
    }

    if (selectedGenre !== 'all') {
      filtered = filtered.filter(book => book.genre === selectedGenre)
    }

    if (selectedAuthor !== 'all') {
      filtered = filtered.filter(book => book.author === selectedAuthor)
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title)
        case 'author':
          return a.author.localeCompare(b.author)
        case 'year':
          return b.publication_year - a.publication_year
        case 'availability':
          return b.available_quantity - a.available_quantity
        default:
          return 0
      }
    })

    setFilteredBooks(filtered)
  }, [books, searchTerm, selectedGenre, selectedAuthor, sortBy])

  const resetFilters = () => {
    setSearchTerm('')
    setSelectedGenre('all')
    setSelectedAuthor('all')
    setSortBy('title')
  }

  const getBookImage = (book: Book) => {
    // Images spécifiques par livre pour plus de réalisme
    const bookImages: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=400&fit=crop', // IA
      2: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop', // Histoire Afrique
      3: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300&h=400&fit=crop', // Mathématiques
      4: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop', // Littérature
      5: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=300&h=400&fit=crop', // Génie Civil
      6: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=300&h=400&fit=crop', // Économie
      7: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=400&fit=crop', // Programmation
      8: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=300&h=400&fit=crop', // Énergies renouvelables
      9: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=300&h=400&fit=crop', // Chimie
      10: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=300&h=400&fit=crop', // Sociologie urbaine
      11: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=300&h=400&fit=crop', // Mécanique des fluides
      12: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=400&fit=crop'  // Marketing digital
    }

    // Images par genre comme fallback
    const genreImages: { [key: string]: string } = {
      'Technologie': 'https://images.unsplash.com/photo-1518709268805-4e9042af2ea0?w=300&h=400&fit=crop',
      'Histoire': 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop',
      'Sciences': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop',
      'Littérature': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      'Ingénierie': 'https://images.unsplash.com/photo-1581094288338-2314dddb7ece?w=300&h=400&fit=crop',
      'Économie': 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=300&h=400&fit=crop',
      'Informatique': 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=300&h=400&fit=crop',
      'Environnement': 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=400&fit=crop',
      'Sociologie': 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=400&fit=crop',
      'Marketing': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=400&fit=crop'
    }

    return bookImages[book.id] || genreImages[book.genre] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-8"></div>
            <p className="text-xl text-gray-600">Chargement du catalogue...</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative bg-black h-[50vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1920&h=800&fit=crop" 
            alt="Bibliothèque" 
            className="w-full h-full object-cover opacity-70 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/90"></div>
        </div>
        
        <motion.div 
          className="relative z-10 text-center text-white px-4"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl font-light mb-6">Catalogue</h1>
          <div className="w-20 h-0.5 bg-white mx-auto mb-6"></div>
          <p className="text-xl font-light max-w-2xl mx-auto opacity-90">
            Explorez notre collection de {books.length} ouvrages soigneusement sélectionnés
          </p>
        </motion.div>
      </div>

      <div className="container mx-auto px-4 py-16">
        {/* Barre de recherche et filtres */}
        <motion.div 
          className="mb-12"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Recherche principale */}
            <div className="relative mb-8">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <Input
                type="text"
                placeholder="Rechercher par titre, auteur ou ISBN..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-4 py-4 text-lg border-2 border-gray-200 focus:border-black rounded-lg bg-gray-50 focus:bg-white transition-all"
              />
            </div>

            {/* Barre de filtres */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border-2 border-gray-200 hover:border-black rounded-lg"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filtres
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                </Button>
                
                {(selectedGenre !== 'all' || selectedAuthor !== 'all' || searchTerm) && (
                  <Button
                    variant="ghost"
                    onClick={resetFilters}
                    className="text-gray-600 hover:text-black"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Réinitialiser
                  </Button>
                )}
              </div>

              <div className="text-sm text-gray-600">
                <span className="font-medium">{filteredBooks.length}</span> livre(s) trouvé(s)
              </div>
            </div>

            {/* Panneau de filtres */}
            {showFilters && (
              <motion.div 
                className="mt-6 p-6 bg-gray-50 border border-gray-200"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Genre
                    </label>
                    <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                      <SelectTrigger className="border-gray-200 focus:border-black rounded-lg">
                        <SelectValue placeholder="Tous les genres" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les genres</SelectItem>
                        {genres.map((genre) => (
                          <SelectItem key={genre} value={genre}>
                            {genre}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Auteur
                    </label>
                    <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                      <SelectTrigger className="border-gray-200 focus:border-black rounded-lg">
                        <SelectValue placeholder="Tous les auteurs" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tous les auteurs</SelectItem>
                        {authors.map((author) => (
                          <SelectItem key={author} value={author}>
                            {author}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Trier par
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="border-gray-200 focus:border-black rounded-lg">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="title">Titre A-Z</SelectItem>
                        <SelectItem value="author">Auteur A-Z</SelectItem>
                        <SelectItem value="year">Année (récent)</SelectItem>
                        <SelectItem value="availability">Disponibilité</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Grille des livres */}
        {filteredBooks.length === 0 ? (
          <motion.div 
            className="text-center py-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Book className="w-20 h-20 text-gray-300 mx-auto mb-6" />
            <h3 className="text-2xl font-light text-gray-900 mb-4">Aucun livre trouvé</h3>
            <p className="text-gray-600">Essayez de modifier vos critères de recherche</p>
          </motion.div>
        ) : (
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                variants={itemVariants}
                className="group bg-white border border-gray-200 hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-xl"
              >
                {/* Image - Format portrait comme un vrai livre */}
                <div className="relative h-72 overflow-hidden rounded-t-xl">
                  <img
                    src={getBookImage(book)}
                    alt={book.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Badge de disponibilité seulement */}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={book.available_quantity > 0 ? "default" : "destructive"}
                      className={`${book.available_quantity > 0 ? "bg-green-600" : "bg-red-600"} rounded-full px-2 py-1 text-xs`}
                    >
                      {book.available_quantity > 0 ? "●" : "●"}
                    </Badge>
                  </div>
                  
                  {/* Genre en bas de l'image */}
                  <div className="absolute bottom-3 left-3">
                    <Badge 
                      variant="secondary" 
                      className="bg-black/80 text-white font-medium rounded-full px-2 py-1 text-xs"
                    >
                      {book.genre}
                    </Badge>
                  </div>
                </div>

                {/* Contenu - Plus compact */}
                <div className="p-4">
                  <h3 className="text-base font-medium text-gray-900 mb-2 group-hover:text-black transition-colors line-clamp-2">
                    {book.title}
                  </h3>
                  
                  <div className="text-gray-600 mb-2">
                    <span className="text-sm line-clamp-1">{book.author}</span>
                  </div>
                  
                  <div className="text-gray-500 mb-3">
                    <span className="text-xs">{book.publication_year}</span>
                  </div>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">
                      {book.available_quantity}/{book.total_quantity} dispo.
                    </span>
                    <span className="text-xs text-gray-400">
                      {book.isbn.slice(-4)}
                    </span>
                  </div>

                  {/* Actions - Plus compactes */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex-1 border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all rounded-lg text-xs"
                    >
                      Voir
                    </Button>
                    <Button 
                      size="sm"
                      className="flex-1 bg-black hover:bg-gray-800 text-white rounded-lg text-xs"
                      disabled={book.available_quantity === 0}
                    >
                      Emprunter
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
      
      <Footer />
    </div>
  )
}

export default Catalogue
