'use client'

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, BookOpen, Tag, Copy, Heart, Download, Share2, Star, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { motion } from 'framer-motion'

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

interface Review {
  id: number
  user_id: number
  book_id: number
  rating: number
  comment: string
  is_approved: boolean
  created_at: string
  user_name?: string
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (id) {
      fetchBookDetails(parseInt(id))
      fetchBookReviews(parseInt(id))
    }
  }, [id])

  const fetchBookDetails = async (bookId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5000/api/books/${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setBook(data.book || data)
      } else {
        setError('Livre non trouvé')
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Données d'exemple si l'API n'est pas disponible
      const exampleBooks: { [key: number]: Book } = {
        1: {
          id: 1,
          title: "Introduction à l'Intelligence Artificielle",
          author: "Dr. Marie Dubois",
          isbn: "978-2-123456-78-9",
          genre: "Technologie",
          description: "Une introduction complète aux concepts fondamentaux de l'intelligence artificielle moderne. Ce livre couvre les algorithmes d'apprentissage automatique, les réseaux de neurones, le traitement du langage naturel et les applications pratiques de l'IA dans différents domaines. Destiné aux étudiants en informatique et ingénierie, il propose une approche progressive avec de nombreux exemples pratiques et exercices corrigés.",
          total_quantity: 5,
          available_quantity: 3,
          publication_year: 2023,
          created_at: "2024-01-01"
        },
        2: {
          id: 2,
          title: "Histoire de l'Afrique Contemporaine",
          author: "Prof. Amadou Diallo",
          isbn: "978-2-987654-32-1",
          genre: "Histoire",
          description: "Un regard approfondi sur l'évolution politique, sociale et culturelle de l'Afrique au XXe et XXIe siècles. L'ouvrage analyse les mouvements d'indépendance, les défis du développement post-colonial, les transformations sociales et l'émergence de nouvelles dynamiques continentales. Une référence incontournable pour comprendre l'Afrique contemporaine.",
          total_quantity: 3,
          available_quantity: 0,
          publication_year: 2022,
          created_at: "2024-01-01"
        },
        3: {
          id: 3,
          title: "Mathématiques Appliquées à l'Ingénierie",
          author: "Prof. Jean-Claude Koné",
          isbn: "978-2-456789-12-3",
          genre: "Sciences",
          description: "Manuel complet de mathématiques pour les étudiants en ingénierie. Couvre le calcul différentiel et intégral, l'algèbre linéaire, les équations différentielles, les statistiques et probabilités. Chaque chapitre inclut des applications concrètes en ingénierie avec des problèmes résolus et des exercices pratiques.",
          total_quantity: 8,
          available_quantity: 5,
          publication_year: 2023,
          created_at: "2024-01-01"
        }
      }
      
      const exampleBook = exampleBooks[bookId]
      if (exampleBook) {
        setBook(exampleBook)
        setError('')
      } else {
        setError('Livre non trouvé dans les exemples')
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchBookReviews = async (bookId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/books/${bookId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error)
      // Données d'exemple d'avis si l'API n'est pas disponible
      const exampleReviews: { [key: number]: Review[] } = {
        1: [
          {
            id: 1,
            user_id: 1,
            book_id: 1,
            rating: 5,
            comment: "Excellent livre pour débuter en IA ! Les explications sont claires et les exemples pratiques très utiles.",
            is_approved: true,
            created_at: "2024-01-15",
            user_name: "Ahmed Traoré"
          },
          {
            id: 2,
            user_id: 2,
            book_id: 1,
            rating: 4,
            comment: "Très bon contenu, mais j'aurais aimé plus d'exercices pratiques sur les réseaux de neurones.",
            is_approved: true,
            created_at: "2024-01-20",
            user_name: "Fatou Diallo"
          }
        ],
        2: [
          {
            id: 3,
            user_id: 3,
            book_id: 2,
            rating: 5,
            comment: "Une analyse remarquable de l'Afrique contemporaine. Indispensable pour comprendre notre histoire récente.",
            is_approved: true,
            created_at: "2024-01-10",
            user_name: "Moussa Sawadogo"
          }
        ],
        3: [
          {
            id: 4,
            user_id: 4,
            book_id: 3,
            rating: 4,
            comment: "Très complet pour les mathématiques appliquées. Les exercices sont bien graduées.",
            is_approved: true,
            created_at: "2024-01-25",
            user_name: "Aïcha Ouédraogo"
          }
        ]
      }
      
      setReviews(exampleReviews[bookId] || [])
    }
  }

  const handleBorrow = async () => {
    if (!book || book.available_quantity === 0) return

    try {
      setBorrowing(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/login')
        return
      }

      const response = await fetch('http://localhost:5000/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: book.id
        })
      })

      if (response.ok) {
        // Actualiser les données du livre
        fetchBookDetails(book.id)
        alert('Livre emprunté avec succès !')
      } else {
        const data = await response.json()
        alert(data.message || 'Erreur lors de l\'emprunt')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de l\'emprunt')
    } finally {
      setBorrowing(false)
    }
  }

  const getBookImage = (book: Book) => {
    // Images spécifiques par livre pour plus de réalisme
    const bookImages: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=600&fit=crop', // IA
      2: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop', // Histoire Afrique
      3: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=400&h=600&fit=crop', // Mathématiques
      4: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop', // Littérature
      5: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=600&fit=crop', // Génie Civil
      6: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=600&fit=crop', // Économie
      7: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=400&h=600&fit=crop', // Programmation
      8: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=600&fit=crop', // Énergies renouvelables
      9: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=400&h=600&fit=crop', // Chimie
      10: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=600&fit=crop', // Sociologie urbaine
      11: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=600&fit=crop', // Mécanique des fluides
      12: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=600&fit=crop'  // Marketing digital
    }

    return bookImages[book.id] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop'
  }

  const copyISBN = () => {
    if (book) {
      navigator.clipboard.writeText(book.isbn)
      alert('ISBN copié dans le presse-papiers !')
    }
  }

  const shareBook = () => {
    if (book && navigator.share) {
      navigator.share({
        title: book.title,
        text: `Découvrez "${book.title}" par ${book.author}`,
        url: window.location.href
      })
    } else if (book) {
      navigator.clipboard.writeText(window.location.href)
      alert('Lien copié dans le presse-papiers !')
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
            <p className="text-gray-600">Chargement du livre...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Livre non trouvé</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/catalogue')} className="bg-black hover:bg-gray-800">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour au catalogue
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/catalogue')}
            className="text-gray-600 hover:text-black"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au catalogue
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Image du livre */}
          <motion.div 
            className="lg:col-span-1"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="overflow-hidden shadow-lg">
              <div className="aspect-[3/4] relative">
                <img
                  src={getBookImage(book)}
                  alt={book.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4">
                  <Badge variant={book.available_quantity > 0 ? "default" : "destructive"}>
                    {book.available_quantity > 0 ? "Disponible" : "Indisponible"}
                  </Badge>
                </div>
              </div>
            </Card>

            {/* Actions rapides */}
            <div className="mt-4 space-y-3">
              <Button 
                onClick={handleBorrow}
                disabled={book.available_quantity === 0 || borrowing}
                className="w-full bg-black hover:bg-gray-800 text-white"
                size="lg"
              >
                <Heart className="w-4 h-4 mr-2" />
                {borrowing ? 'Emprunt en cours...' : 'Emprunter ce livre'}
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={copyISBN}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copier ISBN
                </Button>
                <Button variant="outline" onClick={shareBook}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Partager
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Informations du livre */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="space-y-6">
              {/* Titre et auteur */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                    {book.title}
                  </h1>
                  {reviews.length > 0 && (
                    <div className="flex items-center ml-4">
                      <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      <span className="ml-1 text-lg font-semibold">{getAverageRating()}</span>
                      <span className="ml-1 text-gray-500">({reviews.length} avis)</span>
                    </div>
                  )}
                </div>
                <p className="text-xl text-gray-600 mb-4">par {book.author}</p>
                <Badge variant="secondary" className="text-sm">
                  {book.genre}
                </Badge>
              </div>

              <Separator />

              {/* Informations détaillées */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Informations du livre</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Année</p>
                        <p className="font-medium">{book.publication_year}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">ISBN</p>
                        <p className="font-medium font-mono text-sm">{book.isbn}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Tag className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Disponibilité</p>
                        <p className="font-medium">
                          {book.available_quantity}/{book.total_quantity} exemplaires
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Ajouté le</p>
                        <p className="font-medium">
                          {new Date(book.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {book.description}
                  </p>
                </CardContent>
              </Card>

              {/* Avis des lecteurs */}
              {reviews.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Avis des lecteurs</h3>
                    <div className="space-y-4">
                      {reviews.slice(0, 3).map((review) => (
                        <div key={review.id} className="border-l-2 border-gray-200 pl-4">
                          <div className="flex items-center mb-2">
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < review.rating
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="ml-2 text-sm text-gray-500">
                              {review.user_name || 'Utilisateur anonyme'}
                            </span>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BookDetails
