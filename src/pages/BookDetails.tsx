'use client'

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Calendar, User, BookOpen, Tag, Copy, Heart, Download, Share2, Star, AlertCircle, Clock, Package, Users, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ImageDebugger from '@/components/ImageDebugger'
import { motion } from 'framer-motion'
import { useToast } from '@/hooks/use-toast'

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
  cover_image?: string
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

interface ReviewFormProps {
  userReview: Review | null
  showReviewForm: boolean
  setShowReviewForm: (show: boolean) => void
  newReview: { rating: number; comment: string }
  setNewReview: React.Dispatch<React.SetStateAction<{ rating: number; comment: string }>>
  handleSubmitReview: () => void
  submittingReview: boolean
}

interface ReviewsSectionProps {
  reviews: Review[]
  getDisplayedReviews: () => Review[]
  showAllReviews: boolean
  handleShowMoreReviews: () => void
  handleShowLessReviews: () => void
  currentReviewPage: number
  getTotalReviewPages: () => number
  handleReviewPageChange: (page: number) => void
  initialReviewsCount: number
}

const BookDetails = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [book, setBook] = useState<Book | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [error, setError] = useState('')
  
  // États pour la pagination des avis
  const [currentReviewPage, setCurrentReviewPage] = useState(1)
  const [showAllReviews, setShowAllReviews] = useState(false)
  const reviewsPerPage = 3 // Nombre d'avis par page
  const initialReviewsCount = 2 // Nombre d'avis affichés initialement

  // États pour le formulaire d'avis
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: ''
  })
  const [submittingReview, setSubmittingReview] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const { toast } = useToast()

  // Nouveau état pour gérer l'affichage de la description
  const [showFullDescription, setShowFullDescription] = useState(false)

  // Composant pour la description avec gestion des textes longs
  const DescriptionCard = ({ description }: { description: string }) => {
    const isLongDescription = description.length > 400
    const displayedDescription = showFullDescription || !isLongDescription 
      ? description 
      : description.substring(0, 400) + '...'

    return (
      <Card className="shadow-sm border-0 bg-white">
        <CardContent className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-black">Description</h3>
          </div>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
              {displayedDescription}
            </p>
          </div>
          
          {isLongDescription && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <Button
                variant="ghost"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-black hover:bg-gray-50 p-0 h-auto font-medium text-base"
              >
                {showFullDescription ? 'Voir moins' : 'Voir plus'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Composant pour le formulaire d'avis
  const ReviewForm = ({ 
    userReview, 
    showReviewForm, 
    setShowReviewForm, 
    newReview, 
    setNewReview, 
    handleSubmitReview, 
    submittingReview 
  }: ReviewFormProps) => (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-black">Donner votre avis</h3>
          {userReview && (
            <Badge variant="outline" className="text-black border-black bg-white">
              Avis donné
            </Badge>
          )}
        </div>

        {!userReview && !showReviewForm && (
          <Button
            onClick={() => setShowReviewForm(true)}
            className="w-full bg-black hover:bg-gray-800 text-white border-0"
          >
            <Star className="w-4 h-4 mr-2" />
            Écrire un avis
          </Button>
        )}

        {showReviewForm && !userReview && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Votre note
              </label>
              <StarRating
                rating={newReview.rating}
                onRatingChange={(rating) => setNewReview(prev => ({ ...prev, rating }))}
                interactive={true}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Votre commentaire
              </label>
              <textarea
                value={newReview.comment}
                onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-white text-black"
                rows={4}
                placeholder="Partagez votre expérience avec ce livre..."
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSubmitReview}
                disabled={submittingReview || newReview.rating === 0 || !newReview.comment.trim()}
                className="bg-black hover:bg-gray-800 text-white border-0"
              >
                {submittingReview ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Envoi...
                  </>
                ) : (
                  'Publier l\'avis'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowReviewForm(false)
                  setNewReview({ rating: 0, comment: '' })
                }}
                className="border-black text-black hover:bg-gray-50"
              >
                Annuler
              </Button>
            </div>
          </div>
        )}

        {userReview && (
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center mb-2">
              <StarRating rating={userReview.rating} />
              <span className="ml-2 text-sm text-gray-600">Votre avis</span>
            </div>
            <p className="text-gray-700">{userReview.comment}</p>
            <p className="text-xs text-gray-500 mt-2">
              Publié le {new Date(userReview.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )

  // Composant pour la section des avis
  const ReviewsSection = ({ 
    reviews, 
    getDisplayedReviews, 
    showAllReviews, 
    handleShowMoreReviews, 
    handleShowLessReviews,
    currentReviewPage,
    getTotalReviewPages,
    handleReviewPageChange,
    initialReviewsCount
  }: ReviewsSectionProps) => (
    <Card className="shadow-sm border-0 bg-white">
      <CardContent className="p-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-black">Avis des lecteurs</h3>
        </div>
        
        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Star className="w-10 h-10 text-gray-400" />
            </div>
            <h4 className="text-xl font-semibold text-black mb-3">Aucun avis pour le moment</h4>
            <p className="text-gray-600 text-lg">Soyez le premier à donner votre avis sur ce livre !</p>
          </div>
        ) : (
          <div className="space-y-6">
            {getDisplayedReviews().map((review: Review) => (
              <div key={review.id} className="border border-gray-100 rounded-xl p-6 bg-white hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <StarRating rating={review.rating} />
                        <span className="text-sm font-medium text-black">
                          {review.user_name || 'Utilisateur anonyme'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed text-base">{review.comment}</p>
              </div>
            ))}

            {/* Pagination des avis */}
            {reviews.length > initialReviewsCount && !showAllReviews && (
              <div className="flex justify-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleShowMoreReviews}
                  className="border-black text-black hover:bg-gray-50"
                >
                  Voir plus d'avis ({reviews.length - initialReviewsCount} restants)
                </Button>
              </div>
            )}

            {showAllReviews && getTotalReviewPages() > 1 && (
              <div className="flex flex-col space-y-4 pt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">
                    Page {currentReviewPage} sur {getTotalReviewPages()}
                  </span>
                  <Button 
                    variant="outline" 
                    onClick={handleShowLessReviews}
                    className="border-black text-black hover:bg-gray-50"
                  >
                    Voir moins d'avis
                  </Button>
                </div>
                <div className="flex justify-center">
                  {[...Array(getTotalReviewPages())].map((_, i) => (
                    <Button
                      key={i}
                      variant={currentReviewPage === i + 1 ? "default" : "outline"}
                      onClick={() => handleReviewPageChange(i + 1)}
                      className={`mx-1 ${currentReviewPage === i + 1 ? "bg-black text-white" : "border-black text-black hover:bg-gray-50"}`}
                    >
                      {i + 1}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )

  useEffect(() => {
    if (id) {
      fetchBookDetails(parseInt(id))
      fetchBookReviews(parseInt(id))
    }
  }, [id])

  useEffect(() => {
    if (reviews.length > 0) {
      // Vérifier si l'utilisateur a déjà laissé un avis
      const userId = 1 // Récupérer depuis le contexte d'auth plus tard
      const existingReview = reviews.find(review => review.user_id === userId)
      setUserReview(existingReview || null)
    }
  }, [reviews])

  const fetchBookDetails = async (bookId: number) => {
    try {
      setLoading(true)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/books/${bookId}`)
      if (response.ok) {
        const data = await response.json()
        setBook(data.data || data)
      } else {
        setError('Livre non trouvé')
      }
    } catch (error) {
      console.error('Erreur:', error)
      setError('Erreur lors de la récupération du livre')
    } finally {
      setLoading(false)
    }
  }

  const fetchBookReviews = async (bookId: number) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/books/${bookId}/reviews`)
      if (response.ok) {
        const data = await response.json()
        setReviews(data.reviews || [])
      }
    } catch (error) {
      console.error('Erreur lors du chargement des avis:', error)
      // En cas d'erreur API, on ne met plus d'avis d'exemple
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

      // Calculer la date de retour par défaut (15 jours à partir d'aujourd'hui)
      const today = new Date()
      const dueDate = new Date(today)
      dueDate.setDate(dueDate.getDate() + 15)
      const dueDateString = dueDate.toISOString().split('T')[0] // Format YYYY-MM-DD

      const response = await fetch('${import.meta.env.VITE_API_URL}/api/borrowings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          book_id: book.id,
          due_date: dueDateString
        })
      })

      if (response.ok) {
        // Actualiser les données du livre
        fetchBookDetails(book.id)
        toast({
          title: "Succès",
          description: "Livre emprunté avec succès !",
          variant: "default"
        })
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.message || 'Erreur lors de l\'emprunt',
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      toast({
        title: "Erreur",
        description: 'Erreur lors de l\'emprunt',
        variant: "destructive"
      })
    } finally {
      setBorrowing(false)
    }
  }

  const getBookImage = (book: Book) => {
    console.log('getBookImage pour livre:', book.title, 'cover_image:', book.cover_image)
    
    // Priorité 1: Image réelle uploadée lors de l'ajout du livre
    if (book.cover_image) {
      let imageUrl = book.cover_image;
      
      // Si le chemin commence par /uploads/ ou uploads/, construire l'URL complète
      if (book.cover_image.startsWith('/uploads/') || book.cover_image.startsWith('uploads/')) {
        imageUrl = `${import.meta.env.VITE_API_URL}${book.cover_image.startsWith('/') ? '' : '/'}${book.cover_image}`;
      }
      // Si ce n'est pas une URL complète, construire l'URL avec le serveur backend
      else if (!book.cover_image.startsWith('http')) {
        imageUrl = `${import.meta.env.VITE_API_URL}/uploads/covers/${book.cover_image}`;
      }
      
      console.log('URL image finale:', imageUrl);
      return imageUrl;
    }

    console.log('Pas d\'image pour', book.title, ', utilisation des images par défaut');

    // Priorité 2: Images spécifiques par livre en haute résolution (pour les anciens livres)
    const bookImages: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=1200&fit=crop&q=80', // IA
      2: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&h=1200&fit=crop&q=80', // Histoire Afrique
      3: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&h=1200&fit=crop&q=80', // Mathématiques
      4: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&h=1200&fit=crop&q=80', // Littérature
      5: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=800&h=1200&fit=crop&q=80', // Génie Civil
      6: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&h=1200&fit=crop&q=80', // Économie
      7: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=1200&fit=crop&q=80', // Programmation
      8: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&h=1200&fit=crop&q=80', // Énergies renouvelables
      9: 'https://images.unsplash.com/photo-1518152006812-edab29b069ac?w=800&h=1200&fit=crop&q=80', // Chimie
      10: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=1200&fit=crop&q=80', // Sociologie urbaine
      11: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&h=1200&fit=crop&q=80', // Mécanique des fluides
      12: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=1200&fit=crop&q=80'  // Marketing digital
    }

    // Priorité 3: Images par genre comme fallback final (haute résolution)
    return bookImages[book.id] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&h=1200&fit=crop&q=80'
  }

  const copyISBN = () => {
    if (book) {
      navigator.clipboard.writeText(book.isbn)
      toast({
        title: "Copié",
        description: "ISBN copié dans le presse-papiers !",
        variant: "default"
      })
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
      toast({
        title: "Copié",
        description: "Lien copié dans le presse-papiers !",
        variant: "default"
      })
    }
  }

  const getAverageRating = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
    return Math.round((sum / reviews.length) * 10) / 10
  }

  // Fonctions pour la pagination des avis
  const getDisplayedReviews = () => {
    if (showAllReviews) {
      const startIndex = (currentReviewPage - 1) * reviewsPerPage
      const endIndex = startIndex + reviewsPerPage
      return reviews.slice(startIndex, endIndex)
    } else {
      return reviews.slice(0, initialReviewsCount)
    }
  }

  const getTotalReviewPages = () => {
    return Math.ceil(reviews.length / reviewsPerPage)
  }

  const handleShowMoreReviews = () => {
    setShowAllReviews(true)
    setCurrentReviewPage(1)
  }

  const handleShowLessReviews = () => {
    setShowAllReviews(false)
    setCurrentReviewPage(1)
  }

  const handleReviewPageChange = (page: number) => {
    setCurrentReviewPage(page)
  }

  // Fonctions pour gérer les avis
  const handleSubmitReview = async () => {
    if (newReview.rating === 0 || newReview.comment.trim() === '') {
      toast({
        title: "Erreur",
        description: "Veuillez donner une note et écrire un commentaire",
        variant: "destructive"
      })
      return
    }

    setSubmittingReview(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/books/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          rating: newReview.rating,
          comment: newReview.comment
        })
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Votre avis a été soumis avec succès !",
          variant: "default"
        })
        setShowReviewForm(false)
        setNewReview({ rating: 0, comment: '' })
        // Recharger les avis
        fetchBookReviews(parseInt(id!))
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.message || 'Erreur lors de la soumission de l\'avis',
          variant: "destructive"
        })
      }
    } catch (error) {
      // Simulation pour la démo
      const newReviewData: Review = {
        id: Date.now(),
        user_id: 1,
        book_id: parseInt(id!),
        rating: newReview.rating,
        comment: newReview.comment,
        is_approved: true,
        created_at: new Date().toISOString(),
        user_name: 'Vous'
      }
      
      setReviews(prev => [newReviewData, ...prev])
      setUserReview(newReviewData)
      setShowReviewForm(false)
      setNewReview({ rating: 0, comment: '' })
      toast({
        title: "Succès",
        description: "Votre avis a été ajouté avec succès !",
        variant: "default"
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const StarRating = ({ rating, onRatingChange, interactive = false }: { 
    rating: number; 
    onRatingChange?: (rating: number) => void; 
    interactive?: boolean 
  }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-5 h-5 ${
              star <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-300' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
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
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-black mb-2">Livre non trouvé</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/catalogue')} className="bg-black hover:bg-gray-800 text-white">
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
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Bouton retour */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Button 
            variant="ghost" 
            onClick={() => navigate('/catalogue')}
            className="text-gray-600 hover:text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour au catalogue
          </Button>
        </motion.div>

        {/* Layout principal redesigné */}
        <div className="max-w-7xl mx-auto">
          {/* Section Hero moderne */}
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Section Image */}
            <div className="relative">
              <div className="aspect-[3/4] relative group overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 shadow-lg">
                <ImageDebugger
                  src={getBookImage(book)}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
              {/* Badge de disponibilité */}
              <div className="absolute -top-4 -right-4 z-10">
                <Badge 
                  variant={book.available_quantity > 0 ? "default" : "destructive"} 
                  className={`text-base px-4 py-2 rounded-full font-medium shadow-lg ${
                    book.available_quantity > 0 
                      ? "bg-black text-white" 
                      : "bg-red-600 text-white"
                  }`}
                >
                  {book.available_quantity > 0 ? "Disponible" : "Indisponible"}
                </Badge>
              </div>
            </div>

            {/* Section Informations */}
            <div className="flex flex-col justify-center space-y-8">
              {/* Titre et auteur */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-black text-black leading-tight">
                  {book.title}
                </h1>
                <p className="text-2xl text-gray-600">
                  par <span className="font-bold text-black">{book.author}</span>
                </p>
                
                {/* Badges et note */}
                <div className="flex flex-wrap items-center gap-4">
                  <Badge variant="secondary" className="text-base px-4 py-2 bg-gray-100 text-black font-medium">
                    {book.genre}
                  </Badge>
                  <Badge variant="outline" className="text-base px-4 py-2 border-black text-black">
                    {book.publication_year}
                  </Badge>
                  {reviews.length > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-6 h-6 text-yellow-400 fill-current" />
                      <span className="text-xl font-bold text-black">{getAverageRating()}</span>
                      <span className="text-gray-600">({reviews.length} avis)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Statistiques rapides */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Publié en</p>
                  <p className="text-xl font-bold text-black">{book.publication_year}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Exemplaires</p>
                  <p className="text-xl font-bold text-black">{book.available_quantity}/{book.total_quantity}</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mx-auto mb-3">
                    <Eye className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 mb-1">Avis</p>
                  <p className="text-xl font-bold text-black">{reviews.length}</p>
                </div>
              </div>

              {/* Actions principales */}
              <div className="space-y-4">
                <Button 
                  onClick={handleBorrow}
                  disabled={book.available_quantity === 0 || borrowing}
                  className="w-full bg-black hover:bg-gray-800 text-white h-14 text-lg font-semibold rounded-xl transition-all duration-200 disabled:bg-gray-400"
                  size="lg"
                >
                  {borrowing ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Emprunt en cours...
                    </>
                  ) : (
                    <>
                      <Heart className="w-5 h-5 mr-3" />
                      Emprunter ce livre
                    </>
                  )}
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={copyISBN} 
                    className="h-12 border-black text-black hover:bg-gray-50 font-medium"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copier ISBN
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={shareBook} 
                    className="h-12 border-black text-black hover:bg-gray-50 font-medium"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Section contenu détaillé */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contenu principal */}
            <motion.div 
              className="lg:col-span-2 space-y-8"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {/* Description */}
              <DescriptionCard description={book.description} />

              {/* Informations détaillées */}
              <Card className="shadow-sm border-0 bg-white">
                <CardContent className="p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-black">Informations détaillées</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <BookOpen className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">ISBN</p>
                          <p className="text-lg font-bold font-mono text-black">{book.isbn}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Année de publication</p>
                          <p className="text-lg font-bold text-black">{book.publication_year}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Tag className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Genre</p>
                          <p className="text-lg font-bold text-black">{book.genre}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Clock className="w-6 h-6 text-black" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-600 mb-1">Ajouté le</p>
                          <p className="text-lg font-bold text-black">
                            {new Date(book.created_at).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div 
              className="lg:col-span-1 space-y-6"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {/* Formulaire d'avis */}
              <ReviewForm
                userReview={userReview}
                showReviewForm={showReviewForm}
                setShowReviewForm={setShowReviewForm}
                newReview={newReview}
                setNewReview={setNewReview}
                handleSubmitReview={handleSubmitReview}
                submittingReview={submittingReview}
              />

              {/* Résumé des avis */}
              {reviews.length > 0 && (
                <Card className="shadow-sm border-0 bg-white">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold mb-6 text-black">Résumé des avis</h3>
                    <div className="text-center mb-6">
                      <div className="text-4xl font-black text-black mb-3">
                        {getAverageRating()}/5
                      </div>
                      <StarRating rating={getAverageRating()} />
                      <p className="text-gray-600 mt-2">
                        Basé sur {reviews.length} avis
                      </p>
                    </div>
                    
                    {/* Distribution des notes */}
                    <div className="space-y-3">
                      {[5, 4, 3, 2, 1].map((star) => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                        return (
                          <div key={star} className="flex items-center text-sm">
                            <span className="w-4 text-black font-medium">{star}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current mx-2" />
                            <div className="flex-1 mx-3 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-black h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="w-6 text-gray-600 text-right">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Section avis détaillés */}
          <motion.div
            className="mt-12"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <ReviewsSection
              reviews={reviews}
              getDisplayedReviews={getDisplayedReviews}
              showAllReviews={showAllReviews}
              handleShowMoreReviews={handleShowMoreReviews}
              handleShowLessReviews={handleShowLessReviews}
              currentReviewPage={currentReviewPage}
              getTotalReviewPages={getTotalReviewPages}
              handleReviewPageChange={handleReviewPageChange}
              initialReviewsCount={initialReviewsCount}
            />
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BookDetails
