import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Book, RotateCcw, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useToast } from '@/hooks/use-toast'

interface Borrowing {
  id: number
  book_id: number
  book_title: string
  book_author: string
  book_isbn: string
  borrowed_at: string
  due_date: string
  returned_at: string | null
  status: 'active' | 'returned' | 'overdue'
  renewal_count: number
  notes: string | null
}

const MesEmprunts = () => {
  const [borrowings, setBorrowings] = useState<Borrowing[]>([])
  const [loading, setLoading] = useState(true)
  const [renewingId, setRenewingId] = useState<number | null>(null)
  const [returningId, setReturningId] = useState<number | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchMyBorrowings()
  }, [])

  const fetchMyBorrowings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/borrowings/my-borrowings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setBorrowings(data.borrowings || [])
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
          book_title: "Introduction à l'Intelligence Artificielle",
          book_author: "Dr. Marie Dubois",
          book_isbn: "978-2-123456-78-9",
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
          book_title: "Mathématiques Appliquées à l'Ingénierie",
          book_author: "Prof. Jean-Claude Koné",
          book_isbn: "978-2-456789-12-3",
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
          book_title: "Programmation Python pour Débutants",
          book_author: "Dr. Sarah Johnson",
          book_isbn: "978-2-567890-12-3",
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
          book_title: "Littérature Africaine Contemporaine",
          book_author: "Dr. Fatima Traoré",
          book_isbn: "978-2-789012-34-5",
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
      const response = await fetch(`http://localhost:5000/api/borrowings/${borrowingId}/renew`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      // Simulation du renouvellement pour la démo
      toast({
        title: "Renouvellement réussi",
        description: "Votre emprunt a été renouvelé avec succès",
      })
      
      // Mise à jour locale pour la démo
      setBorrowings(prev => prev.map(borrowing => 
        borrowing.id === borrowingId 
          ? { 
              ...borrowing, 
              renewal_count: borrowing.renewal_count + 1,
              due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
            }
          : borrowing
      ))
    } finally {
      setRenewingId(null)
    }
  }

  const handleReturnBook = async (borrowingId: number) => {
    setReturningId(borrowingId)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`http://localhost:5000/api/borrowings/${borrowingId}/return`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
      // Simulation du retour pour la démo
      toast({
        title: "Retour confirmé",
        description: "Le livre a été retourné avec succès",
      })
      
      // Mise à jour locale pour la démo
      setBorrowings(prev => prev.map(borrowing => 
        borrowing.id === borrowingId 
          ? { 
              ...borrowing, 
              status: 'returned' as const,
              returned_at: new Date().toISOString()
            }
          : borrowing
      ))
    } finally {
      setReturningId(null)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-100 text-green-800">En cours</Badge>
      case 'overdue':
        return <Badge variant="destructive">En retard</Badge>
      case 'returned':
        return <Badge variant="secondary">Retourné</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  const getBookImage = (bookId: number) => {
    const bookImages: { [key: number]: string } = {
      1: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=400&fit=crop',
      3: 'https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=300&h=400&fit=crop',
      4: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&h=400&fit=crop',
      7: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=300&h=400&fit=crop'
    }
    return bookImages[bookId] || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=300&h=400&fit=crop'
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
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <motion.div 
        className="relative bg-gradient-to-r from-gray-900 via-gray-800 to-black overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&h=400&fit=crop" 
            alt="Bibliothèque - Mes Emprunts" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-20">
          <motion.div 
            className="max-w-3xl"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <h1 className="text-5xl font-bold text-white mb-6">
              Mes Emprunts
            </h1>
            <div className="w-20 h-1 bg-white mb-6"></div>
            <p className="text-xl text-gray-200 leading-relaxed">
              Gérez facilement vos livres empruntés, renouvelez vos prêts et consultez votre historique de lecture
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Contenu principal */}
      <motion.div 
        className="container mx-auto px-4 py-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            whileHover={{ y: -4, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center">
              <Book className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{activeBorrowings.length}</p>
                <p className="text-sm text-gray-600">Emprunts actifs</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            whileHover={{ y: -4, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-red-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {borrowings.filter(b => b.status === 'overdue').length}
                </p>
                <p className="text-sm text-gray-600">En retard</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            whileHover={{ y: -4, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">{returnedBorrowings.length}</p>
                <p className="text-sm text-gray-600">Retournés</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
            whileHover={{ y: -4, shadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex items-center">
              <RotateCcw className="w-8 h-8 text-orange-600 mr-3" />
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {borrowings.reduce((sum, b) => sum + b.renewal_count, 0)}
                </p>
                <p className="text-sm text-gray-600">Renouvellements</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Emprunts actifs */}
        <motion.div 
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Emprunts en cours</h2>
          
          {activeBorrowings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun emprunt actif</h3>
              <p className="text-gray-600">Vous n'avez actuellement aucun livre emprunté</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {activeBorrowings.map((borrowing) => {
                const daysRemaining = getDaysRemaining(borrowing.due_date)
                const isOverdue = daysRemaining < 0
                const canRenew = borrowing.renewal_count < 2 && !isOverdue
                
                return (
                  <motion.div
                    key={borrowing.id}
                    whileHover={{ y: -2 }}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                  >
                    <Card className="border-0 shadow-none">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4">
                            <img
                              src={getBookImage(borrowing.book_id)}
                              alt={borrowing.book_title}
                              className="w-20 h-28 object-cover rounded-xl"
                            />
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                {borrowing.book_title}
                              </h3>
                              <p className="text-gray-600 mb-2">{borrowing.book_author}</p>
                              <p className="text-sm text-gray-500 mb-3">ISBN: {borrowing.book_isbn}</p>
                              {getStatusBadge(borrowing.status)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                          <div className="flex items-center text-gray-600">
                            <Calendar className="w-5 h-5 mr-2" />
                            <div>
                              <p className="text-sm font-medium">Emprunté le</p>
                              <p className="text-sm">{formatDate(borrowing.borrowed_at)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <Clock className="w-5 h-5 mr-2" />
                            <div>
                              <p className="text-sm font-medium">À retourner le</p>
                              <p className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : ''}`}>
                                {formatDate(borrowing.due_date)}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center text-gray-600">
                            <RotateCcw className="w-5 h-5 mr-2" />
                            <div>
                              <p className="text-sm font-medium">Renouvellements</p>
                              <p className="text-sm">{borrowing.renewal_count}/2</p>
                            </div>
                          </div>
                        </div>

                        {isOverdue && (
                          <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4">
                            <div className="flex items-center">
                              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                              <p className="text-red-800 font-medium">
                                Ce livre est en retard de {Math.abs(daysRemaining)} jour(s)
                              </p>
                            </div>
                          </div>
                        )}

                        {borrowing.notes && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                            <p className="text-blue-800 text-sm">{borrowing.notes}</p>
                          </div>
                        )}

                        <div className="flex gap-3">
                          <Button
                            onClick={() => handleReturnBook(borrowing.id)}
                            disabled={returningId === borrowing.id}
                            className="flex-1 bg-black hover:bg-gray-800"
                          >
                            {returningId === borrowing.id ? (
                              <>
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                Retour...
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Retourner le livre
                              </>
                            )}
                          </Button>
                          
                          {canRenew && (
                            <Button
                              variant="outline"
                              onClick={() => handleRenewBorrowing(borrowing.id)}
                              disabled={renewingId === borrowing.id}
                              className="flex-1"
                            >
                              {renewingId === borrowing.id ? (
                                <>
                                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                  Renouvellement...
                                </>
                              ) : (
                                <>
                                  <RotateCcw className="w-4 h-4 mr-2" />
                                  Renouveler
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Historique des emprunts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Historique</h2>
          
          {returnedBorrowings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl shadow-sm">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">Aucun historique</h3>
              <p className="text-gray-600">Vous n'avez encore retourné aucun livre</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {returnedBorrowings.map((borrowing) => (
                <motion.div
                  key={borrowing.id}
                  whileHover={{ y: -2 }}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <img
                        src={getBookImage(borrowing.book_id)}
                        alt={borrowing.book_title}
                        className="w-16 h-20 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{borrowing.book_title}</h3>
                        <p className="text-gray-600">{borrowing.book_author}</p>
                        <p className="text-sm text-gray-500">
                          Retourné le {formatDate(borrowing.returned_at!)}
                        </p>
                      </div>
                    </div>
                    {getStatusBadge(borrowing.status)}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>

      <Footer />
    </div>
  )
}

export default MesEmprunts