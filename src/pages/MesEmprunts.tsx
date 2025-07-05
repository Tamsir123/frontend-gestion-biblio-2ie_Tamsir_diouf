import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Book, RotateCcw, CheckCircle, AlertTriangle, RefreshCw, Star, Package, User, BookOpen, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReviewModal from '@/components/ReviewModal'
import { useToast } from '@/hooks/use-toast'

interface Borrowing {
  id: number
  book_id: number
  title: string          // Changé de book_title à title
  author: string         // Changé de book_author à author
  isbn: string          // Changé de book_isbn à isbn
  cover_image?: string  // Ajout du champ pour l'image de couverture
  borrowed_at: string
  due_date: string
  returned_at: string | null
  status: 'active' | 'returned' | 'overdue'
  current_status?: string // Ajouté car le backend renvoie aussi current_status
  renewal_count: number
  notes: string | null
  comment_text?: string | null // Ajouté
  days_overdue?: number // Ajouté
}

const MesEmprunts = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)
  const [renewingId, setRenewingId] = useState<number | null>(null)
  const [returningId, setReturningId] = useState<number | null>(null)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBookForReview, setSelectedBookForReview] = useState<{
    id: number
    title: string
    author: string
    cover_image?: string
  } | null>(null)
  const [userReviews, setUserReviews] = useState<{ [bookId: number]: boolean }>({})
  const { toast } = useToast()

  useEffect(() => {
    fetchMyBorrowings()
    checkUserReviews()
  }, [])

  // Vérifier quels livres ont déjà des avis de l'utilisateur
  const checkUserReviews = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      // Récupérer les avis de l'utilisateur
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/my-reviews`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const reviewedBooks: { [bookId: number]: boolean } = {}
        
        if (data.reviews) {
          data.reviews.forEach((review: { book_id: number }) => {
            reviewedBooks[review.book_id] = true
          })
        }
        
        setUserReviews(reviewedBooks)
      }
    } catch (error) {
      console.error('Erreur lors de la vérification des avis:', error)
    }
  }

  const fetchMyBorrowings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setBorrowings([])
        console.error('Aucun token trouvé. Veuillez vous reconnecter.')
        return
      }
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/borrowings/my-borrowings`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        // Adapter la structure des données backend vers frontend
        const borrowingsData = (data.data?.borrowings || []).map((borrowing: Record<string, unknown>) => ({
          ...borrowing,
          // Utiliser les noms des champs tels qu'ils viennent du backend
        }))
        setBorrowings(borrowingsData)
      } else if (response.status === 401) {
        setBorrowings([])
        console.error('Non autorisé. Veuillez vous reconnecter.')
      } else {
        console.error('Erreur lors de la récupération des emprunts')
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Données d'exemple si l'API n'est pas disponible
      const testBorrowings: Borrowing[] = [
        {
          id: 1,
          book_id: 1,
          title: "Introduction à l'Intelligence Artificielle",
          author: "Dr. Marie Dubois",
          isbn: "978-2-123456-78-9",
          borrowed_at: "2024-12-01T10:00:00Z",
          due_date: "2024-12-31T23:59:59Z",
          returned_at: null,
          status: 'active',
          renewal_count: 0,
          notes: null
        },
        {
          id: 2,
          book_id: 3,
          title: "Mathématiques Appliquées à l'Ingénierie",
          author: "Prof. Jean-Claude Koné",
          isbn: "978-2-456789-12-3",
          borrowed_at: "2024-11-15T14:30:00Z",
          due_date: "2024-12-20T23:59:59Z",
          returned_at: null,
          status: 'overdue',
          renewal_count: 1,
          notes: "Prolongation accordée pour projet de fin d'études"
        },
        {
          id: 3,
          book_id: 7,
          title: "Programmation Python pour Débutants",
          author: "Dr. Sarah Johnson",
          isbn: "978-2-567890-12-3",
          borrowed_at: "2024-11-20T09:15:00Z",
          due_date: "2024-12-25T23:59:59Z",
          returned_at: null,
          status: 'active',
          renewal_count: 2,
          notes: null
        },
        {
          id: 4,
          book_id: 4,
          title: "Littérature Africaine Contemporaine",
          author: "Dr. Fatima Traoré",
          isbn: "978-2-789012-34-5",
          borrowed_at: "2024-10-10T16:45:00Z",
          due_date: "2024-11-10T23:59:59Z",
          returned_at: "2024-11-08T14:20:00Z",
          status: 'returned',
          renewal_count: 0,
          notes: null
        }
      ]
      setBorrowings(testBorrowings)
    } finally {
      setLoading(false)
    }
  }

  const handleRenewBorrowing = async (borrowingId: number) => {
    setRenewingId(borrowingId)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour renouveler un emprunt",
          variant: "destructive"
        })
        return
      }

      // Calculer une nouvelle date d'échéance (+ 14 jours)
      const newDueDate = new Date()
      newDueDate.setDate(newDueDate.getDate() + 14)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/borrowings/${borrowingId}/renew`, {
        method: 'PUT', // Correction: PUT au lieu de POST
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          new_due_date: newDueDate.toISOString().split('T')[0] // Format YYYY-MM-DD
        })
      })

      if (response.ok) {
        toast({
          title: "Renouvellement réussi",
          description: "Votre emprunt a été renouvelé avec succès",
        })
        fetchMyBorrowings() // Actualiser la liste
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.message || "Impossible de renouveler l'emprunt",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors du renouvellement:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du renouvellement",
        variant: "destructive"
      })
    } finally {
      setRenewingId(null)
    }
  }

  const handleReturnBook = async (borrowingId: number) => {
    setReturningId(borrowingId)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour retourner un livre",
          variant: "destructive"
        })
        return
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/borrowings/${borrowingId}/return`, {
        method: 'PUT', // Correction: PUT au lieu de POST
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          notes: "Retour effectué via l'interface utilisateur"
        })
      })

      if (response.ok) {
        toast({
          title: "Retour confirmé",
          description: "Le livre a été retourné avec succès",
        })
        fetchMyBorrowings() // Actualiser la liste
      } else {
        const errorData = await response.json()
        toast({
          title: "Erreur",
          description: errorData.message || "Impossible de retourner le livre",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Erreur lors du retour:', error)
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du retour du livre",
        variant: "destructive"
      })
    } finally {
      setReturningId(null)
    }
  }

  // Ouvrir la modal de review pour un livre
  const handleOpenReviewModal = (borrowing: Borrowing) => {
    setSelectedBookForReview({
      id: borrowing.book_id,
      title: borrowing.title,
      author: borrowing.author,
      cover_image: borrowing.cover_image
    })
    setReviewModalOpen(true)
  }

  // Fermer la modal de review
  const handleCloseReviewModal = () => {
    setReviewModalOpen(false)
    setSelectedBookForReview(null)
  }

  // Callback après soumission d'un avis
  const handleReviewSubmitted = () => {
    if (selectedBookForReview) {
      setUserReviews(prev => ({
        ...prev,
        [selectedBookForReview.id]: true
      }))
    }
    // Recharger les avis pour ce livre
    checkUserReviews()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-black text-white border-0">En cours</Badge>
      case 'overdue':
        return <Badge variant="destructive" className="bg-red-600 text-white border-0">En retard</Badge>
      case 'returned':
        return <Badge variant="secondary" className="bg-gray-100 text-black border-0">Retourné</Badge>
      default:
        return <Badge variant="outline" className="border-black text-black">{status}</Badge>
    }
  }

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Fonction pour obtenir l'image du livre (utilise uniquement les vraies images)
  const getBookImage = (bookId: number, coverImage?: string) => {
    // Si une image de couverture est fournie par l'API
    if (coverImage) {
      // Si l'image commence par '/', c'est un chemin relatif du serveur
      if (coverImage.startsWith('/')) {
        return `${import.meta.env.VITE_API_URL}${coverImage}`
      }
      // Sinon, c'est déjà une URL complète
      return coverImage
    }
    
    // Image par défaut si aucune image n'est disponible
    return '/placeholder.svg' // Utilise l'image placeholder du projet
  }

  const activeBorrowings = borrowings.filter(b => b.status === 'active' || b.status === 'overdue')
  const returnedBorrowings = borrowings.filter(b => b.status === 'returned')

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
            <p className="text-xl text-gray-600">Chargement de vos emprunts...</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section moderne avec image */}
      <motion.div 
        className="relative bg-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop" 
            alt="Bibliothèque - Mes Emprunts" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60"></div>
        </div>
        
        {/* Contenu */}
        <div className="relative container mx-auto px-4 py-20">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-8">
              <Book className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-white mb-6">
              Mes Emprunts
            </h1>
            <p className="text-xl text-gray-200 leading-relaxed max-w-2xl mx-auto">
              Gérez facilement vos livres empruntés, renouvelez vos prêts et consultez votre historique de lecture
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div 
        className="container mx-auto px-4 py-12"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        {/* Statistiques modernes */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <motion.div 
            className="text-center p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <p className="text-3xl font-black text-black mb-2">{activeBorrowings.length}</p>
            <p className="text-gray-600 font-medium">Emprunts actifs</p>
          </motion.div>

          <motion.div 
            className="text-center p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-8 h-8 text-white" />
            </div>
            <p className="text-3xl font-black text-black mb-2">
              {borrowings.filter(b => b.status === 'overdue').length}
            </p>
            <p className="text-gray-600 font-medium">En retard</p>
          </motion.div>

          <motion.div 
            className="text-center p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <p className="text-3xl font-black text-black mb-2">{returnedBorrowings.length}</p>
            <p className="text-gray-600 font-medium">Retournés</p>
          </motion.div>

          <motion.div 
            className="text-center p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-lg transition-all duration-300"
            whileHover={{ y: -5 }}
          >
            <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
              <RotateCcw className="w-8 h-8 text-white" />
            </div>
            <p className="text-3xl font-black text-black mb-2">
              {borrowings.reduce((sum, b) => sum + b.renewal_count, 0)}
            </p>
            <p className="text-gray-600 font-medium">Renouvellements</p>
          </motion.div>
        </div>

        {/* Emprunts actifs */}
        <motion.div 
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-3xl font-black text-black">Emprunts en cours</h2>
          </div>
          
          {activeBorrowings.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <Book className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Aucun emprunt actif</h3>
              <p className="text-gray-600 text-lg">Vous n'avez actuellement aucun livre emprunté</p>
            </div>
          ) : (
            <div className="space-y-8">
              {activeBorrowings.map((borrowing) => {
                const daysRemaining = getDaysRemaining(borrowing.due_date)
                const isOverdue = daysRemaining < 0
                const canRenew = borrowing.renewal_count < 2 && !isOverdue
                
                return (
                  <motion.div
                    key={borrowing.id}
                    whileHover={{ y: -5 }}
                    className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    <div className="p-8">
                      {/* Header avec info du livre */}
                      <div className="flex items-start gap-8 mb-8">
                        <div className="relative">
                          <img
                            src={getBookImage(borrowing.book_id, borrowing.cover_image)}
                            alt={borrowing.title}
                            className="w-28 h-36 object-cover rounded-2xl shadow-lg"
                          />
                          <div className="absolute -top-3 -right-3">
                            {getStatusBadge(borrowing.status)}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="mb-6">
                            <h3 className="text-2xl font-black text-black mb-3 leading-tight">
                              {borrowing.title}
                            </h3>
                            <p className="text-lg text-gray-600 mb-2">{borrowing.author}</p>
                            <p className="text-sm text-gray-500 font-mono">ISBN: {borrowing.isbn}</p>
                          </div>
                          
                          {isOverdue && (
                            <div className="flex items-center bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
                              <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
                              <span className="font-medium">
                                En retard de {Math.abs(daysRemaining)} jour(s)
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Informations détaillées */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                            <Calendar className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Date d'emprunt</p>
                            <p className="text-lg font-bold text-black">
                              {formatDate(borrowing.borrowed_at)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isOverdue ? 'bg-red-600' : 'bg-black'}`}>
                            <Clock className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Date de retour</p>
                            <p className={`text-lg font-bold ${isOverdue ? 'text-red-600' : 'text-black'}`}>
                              {formatDate(borrowing.due_date)}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                            <RotateCcw className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600 mb-1">Renouvellements</p>
                            <p className="text-lg font-bold text-black">
                              {borrowing.renewal_count}/2
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Notes si présentes */}
                      {borrowing.notes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              <AlertTriangle className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="text-sm font-bold text-blue-800 mb-2">Note</p>
                              <p className="text-blue-700">{borrowing.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-4">
                        <Button
                          onClick={() => handleReturnBook(borrowing.id)}
                          disabled={returningId === borrowing.id}
                          className="flex-1 bg-black hover:bg-gray-800 text-white h-12 rounded-xl font-semibold transition-all duration-200"
                        >
                          {returningId === borrowing.id ? (
                            <>
                              <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                              Retour en cours...
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-5 h-5 mr-3" />
                              Retourner le livre
                            </>
                          )}
                        </Button>
                        
                        {canRenew && (
                          <Button
                            variant="outline"
                            onClick={() => handleRenewBorrowing(borrowing.id)}
                            disabled={renewingId === borrowing.id}
                            className="flex-1 border-black text-black hover:bg-gray-50 h-12 rounded-xl font-semibold transition-all duration-200"
                          >
                            {renewingId === borrowing.id ? (
                              <>
                                <RefreshCw className="w-5 h-5 mr-3 animate-spin" />
                                Renouvellement...
                              </>
                            ) : (
                              <>
                                <RotateCcw className="w-5 h-5 mr-3" />
                                Renouveler ({2 - borrowing.renewal_count} restant)
                              </>
                            )}
                          </Button>
                        )}
                        
                        {!canRenew && borrowing.renewal_count >= 2 && (
                          <div className="flex-1 bg-gray-100 text-gray-500 h-12 rounded-xl font-semibold flex items-center justify-center">
                            <RotateCcw className="w-5 h-5 mr-3" />
                            Limite de renouvellement atteinte
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Historique des emprunts */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-3xl font-black text-black">Historique</h2>
            </div>
            {returnedBorrowings.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl px-6 py-3">
                <p className="text-sm text-blue-800 flex items-center font-medium">
                  <Star className="w-4 h-4 mr-2 text-blue-600" />
                  Partagez votre expérience en donnant un avis !
                </p>
              </div>
            )}
          </div>
          
          {returnedBorrowings.length === 0 ? (
            <div className="text-center py-20 bg-white border border-gray-100 rounded-2xl">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-8">
                <CheckCircle className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Aucun historique</h3>
              <p className="text-gray-600 text-lg mb-6">Vous n'avez encore retourné aucun livre</p>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 max-w-md mx-auto">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-bold text-blue-800 mb-2">Le saviez-vous ?</p>
                    <p className="text-sm text-blue-700">
                      Après avoir retourné un livre, vous pourrez laisser un avis pour aider les autres lecteurs !
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {returnedBorrowings.map((borrowing) => (
                <motion.div
                  key={borrowing.id}
                  whileHover={{ y: -3 }}
                  className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      <img
                        src={getBookImage(borrowing.book_id, borrowing.cover_image)}
                        alt={borrowing.title}
                        className="w-16 h-20 object-cover rounded-xl shadow-sm"
                      />
                      <div>
                        <h3 className="text-xl font-bold text-black mb-1">{borrowing.title}</h3>
                        <p className="text-gray-600 mb-2">{borrowing.author}</p>
                        <div className="flex items-center text-sm text-gray-500">
                          <CheckCircle className="w-4 h-4 mr-2 text-black" />
                          Retourné le {formatDate(borrowing.returned_at!)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {getStatusBadge(borrowing.status)}
                      {/* Bouton pour donner un avis */}
                      {!userReviews[borrowing.book_id] ? (
                        <Button
                          onClick={() => handleOpenReviewModal(borrowing)}
                          size="sm"
                          className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center space-x-2"
                        >
                          <Star className="w-4 h-4" />
                          <span className="hidden sm:inline">Donner un avis</span>
                          <span className="sm:hidden">Avis</span>
                        </Button>
                      ) : (
                        <Badge className="bg-gray-100 text-black border-0">
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          <span className="hidden sm:inline">Avis donné</span>
                          <span className="sm:hidden">✓</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      <Footer />

      {/* Modal de review */}
      {reviewModalOpen && selectedBookForReview && (
        <ReviewModal 
          isOpen={reviewModalOpen}
          onClose={handleCloseReviewModal}
          book={selectedBookForReview}
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  )
}

export default MesEmprunts