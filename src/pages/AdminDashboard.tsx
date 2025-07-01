import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Users, 
  BookOpen, 
  FileText, 
  Star,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle,
  Settings,
  LogOut,
  Menu,
  Search,
  Plus,
  Eye,
  RefreshCw,
  BarChart3,
  Activity,
  Bell,
  Shield,
  LucideIcon
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import { Dialog } from '@/components/ui/dialog'

interface DashboardStats {
  total_users: number
  total_books: number
  total_borrowings: number
  active_borrowings: number
  overdue_borrowings: number
  pending_reviews: number
  new_users_this_month: number
  books_borrowed_this_month: number
  total_reviews: number
  average_rating: number
}

interface Borrowing {
  id: number
  user_id: number
  book_id: number
  borrowed_at: string
  due_date: string
  returned_at?: string
  status: 'active' | 'returned' | 'overdue'
  current_status: 'active' | 'returned' | 'overdue'
  days_overdue?: number
  notes?: string
  user_name: string
  user_email: string
  title: string
  author: string
  isbn: string
}

interface BorrowingsResponse {
  borrowings: Borrowing[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

interface RecentActivity {
  id: number
  type: 'borrowing' | 'return' | 'user_registration' | 'book_added' | 'review_added'
  message: string
  timestamp: string
  user?: string
}

interface QuickAction {
  icon: LucideIcon
  label: string
  description: string
  action: () => void
  variant: 'default' | 'destructive' | 'outline' | 'secondary'
  color: string
}

interface StatCardProps {
  icon: LucideIcon
  title: string
  value: number | string
  change?: number
  color: string
  description?: string
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [books, setBooks] = useState([])
  const [booksLoading, setBooksLoading] = useState(false)
  const [borrowings, setBorrowings] = useState([])
  const [borrowingsLoading, setBorrowingsLoading] = useState(false)
  const [borrowingsStats, setBorrowingsStats] = useState(null)
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [showEditBookModal, setShowEditBookModal] = useState(false)
  const [selectedBook, setSelectedBook] = useState(null)
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    publication_year: '',
    total_quantity: 1,
    description: ''
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.log('Pas de token pour récupérer les stats')
        setLoading(false)
        return
      }

      console.log('Récupération des statistiques du dashboard...')
      
      // Récupérer les statistiques réelles depuis l'API
      const [booksRes, usersRes, borrowingsRes] = await Promise.all([
        fetch('http://localhost:5000/api/books', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/users', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null), // En cas d'erreur, continuer sans les users
        fetch('http://localhost:5000/api/borrowings', {
          headers: { 'Authorization': `Bearer ${token}` }
        }).catch(() => null) // En cas d'erreur, continuer sans les emprunts
      ])

      let totalBooks = 0
      let totalUsers = 245 // Valeur par défaut si l'API users n'est pas disponible
      let totalBorrowings = 0
      let activeBorrowings = 0
      let overdueBorrowings = 0

      // Traiter les livres
      if (booksRes.ok) {
        const booksData = await booksRes.json()
        console.log('Données livres pour stats:', booksData)
        totalBooks = booksData.data?.books ? booksData.data.books.length : 
                    booksData.books ? booksData.books.length : 0
        console.log('Nombre de livres récupérés:', totalBooks)
      } else {
        console.log('Erreur lors de la récupération des livres:', booksRes.status)
      }

      // Traiter les utilisateurs (si l'API est disponible)
      if (usersRes && usersRes.ok) {
        const usersData = await usersRes.json()
        totalUsers = usersData.users ? usersData.users.length : totalUsers
        console.log('Nombre d\'utilisateurs récupérés:', totalUsers)
      }

      // Traiter les emprunts (si l'API est disponible)
      if (borrowingsRes && borrowingsRes.ok) {
        const borrowingsData = await borrowingsRes.json()
        console.log('Données emprunts pour stats:', borrowingsData)
        
        const borrowings = borrowingsData.data?.borrowings || borrowingsData.borrowings || []
        totalBorrowings = borrowingsData.data?.pagination?.total || borrowings.length
        
        // Compter les emprunts actifs et en retard
        activeBorrowings = borrowings.filter(b => b.current_status === 'active').length
        overdueBorrowings = borrowings.filter(b => b.current_status === 'overdue').length
        
        console.log('Statistiques emprunts:', {
          total: totalBorrowings,
          actifs: activeBorrowings,
          retards: overdueBorrowings
        })
      } else {
        console.log('Erreur lors de la récupération des emprunts pour les stats')
      }

      // Créer les statistiques avec les vraies données
      const realStats: DashboardStats = {
        total_users: totalUsers,
        total_books: totalBooks,
        total_borrowings: totalBorrowings,
        active_borrowings: activeBorrowings,
        overdue_borrowings: overdueBorrowings,
        pending_reviews: 0,
        new_users_this_month: 0,
        books_borrowed_this_month: 0,
        total_reviews: 0,
        average_rating: 0
      }

      console.log('Statistiques finales:', realStats)
      setStats(realStats)
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  const fetchBooks = useCallback(async () => {
    setBooksLoading(true)
    try {
      console.log('=== RÉCUPÉRATION DES LIVRES ===')
      console.log('URL:', 'http://localhost:5000/api/books')
      
      const res = await fetch('http://localhost:5000/api/books')
      console.log('Statut de la réponse:', res.status, res.statusText)
      
      const data = await res.json()
      console.log('Données brutes reçues:', data)
      console.log('Type de data:', typeof data)
      console.log('data.data:', data.data)
      console.log('data.data.books:', data.data?.books)
      console.log('Nombre de livres:', data.data?.books ? data.data.books.length : 'undefined')
      
      if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement des livres')
      
      // Adapter la structure de réponse
      const booksArray = data.data?.books || data.books || data || []
      console.log('Livres à afficher:', booksArray)
      console.log('Nombre final de livres:', booksArray.length)
      
      setBooks(booksArray)
    } catch (error) {
      console.error('=== ERREUR LORS DU CHARGEMENT DES LIVRES ===')
      console.error('Error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les livres",
        variant: "destructive"
      })
    } finally {
      setBooksLoading(false)
    }
  }, [toast])

  const fetchBorrowings = useCallback(async () => {
    setBorrowingsLoading(true)
    try {
      console.log('=== RÉCUPÉRATION DES EMPRUNTS ===')
      const token = localStorage.getItem('token')
      
      if (!token) {
        console.error('Token manquant pour récupérer les emprunts')
        return
      }

      console.log('URL:', 'http://localhost:5000/api/borrowings')
      
      const res = await fetch('http://localhost:5000/api/borrowings', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      
      console.log('Statut de la réponse emprunts:', res.status, res.statusText)
      
      const data = await res.json()
      console.log('Données brutes emprunts reçues:', data)
      
      if (!res.ok) throw new Error(data.message || 'Erreur lors du chargement des emprunts')
      
      // Adapter la structure de réponse
      const borrowingsData = data.data?.borrowings || data.borrowings || []
      console.log('Emprunts à afficher:', borrowingsData)
      console.log('Nombre d\'emprunts:', borrowingsData.length)
      
      setBorrowings(borrowingsData)
      setBorrowingsStats(data.data?.pagination || null)
    } catch (error) {
      console.error('=== ERREUR LORS DU CHARGEMENT DES EMPRUNTS ===')
      console.error('Error:', error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les emprunts",
        variant: "destructive"
      })
    } finally {
      setBorrowingsLoading(false)
    }
  }, [toast])

  const handleAddBook = async (bookData) => {
    try {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      
      console.log('=== TENTATIVE D\'AJOUT DE LIVRE ===')
      console.log('Token présent:', !!token)
      console.log('Token value:', token ? token.substring(0, 20) + '...' : 'null')
      console.log('User data:', userStr)
      
      if (!token) {
        console.log('ERREUR: Aucun token trouvé')
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive"
        })
        return
      }

      if (userStr) {
        const user = JSON.parse(userStr)
        console.log('Rôle utilisateur:', user.role)
      }

      // Préparer FormData pour supporter l'upload d'image
      const formData = new FormData()
      Object.entries(bookData).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Ajouter l'image si elle existe
      if (coverImageFile) {
        formData.append('cover_image', coverImageFile)
        console.log('Image ajoutée:', coverImageFile.name)
      }

      console.log('Données à envoyer:', Object.fromEntries(formData))
      console.log('URL de requête:', 'http://localhost:5000/api/books')
      console.log('Headers:', { 'Authorization': `Bearer ${token.substring(0, 20)}...` })

      const res = await fetch('http://localhost:5000/api/books', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
        },
        body: formData
      })

      console.log('Réponse reçue:', res.status, res.statusText)
      
      const data = await res.json()
      console.log('Données de réponse:', data)
      
      if (!res.ok) throw new Error(data.message)

      toast({
        title: "Succès",
        description: "Livre ajouté avec succès"
      })
      
      // Rafraîchir les données
      fetchBooks()
      fetchDashboardData() // Mettre à jour les statistiques
      
      setShowAddBookModal(false)
      setCoverImageFile(null)
      setCoverImagePreview(null)
      setNewBook({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        publication_year: '',
        total_quantity: 1,
        description: ''
      })
    } catch (error) {
      console.error('=== ERREUR LORS DE L\'AJOUT ===')
      console.error('Error object:', error)
      console.error('Error message:', error.message)
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'ajout",
        variant: "destructive"
      })
    }
  }

  const handleEditBook = async (bookData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté",
          variant: "destructive"
        })
        return
      }

      // Préparer FormData pour supporter l'upload d'image
      const formData = new FormData()
      Object.entries(bookData).forEach(([key, value]) => {
        if (value !== '' && value !== undefined && value !== null) {
          formData.append(key, String(value))
        }
      })

      // Ajouter l'image si elle existe
      if (coverImageFile) {
        formData.append('cover_image', coverImageFile)
      }

      const res = await fetch(`http://localhost:5000/api/books/${selectedBook.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
          // Ne pas définir Content-Type pour FormData
        },
        body: formData
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.message)

      toast({
        title: "Succès",
        description: "Livre modifié avec succès"
      })
      
      // Rafraîchir les données
      fetchBooks()
      fetchDashboardData() // Mettre à jour les statistiques
      
      setShowEditBookModal(false)
      setSelectedBook(null)
      setCoverImageFile(null)
      setCoverImagePreview(null)
      setNewBook({
        title: '',
        author: '',
        genre: '',
        isbn: '',
        publication_year: '',
        total_quantity: 1,
        description: ''
      })
    } catch (error) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la modification",
        variant: "destructive"
      })
    }
  }

  const handleDeleteBook = async (bookId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`http://localhost:5000/api/books/${bookId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!res.ok) throw new Error('Erreur lors de la suppression')

      toast({
        title: "Succès",
        description: "Livre supprimé avec succès"
      })
      
      // Rafraîchir les données
      fetchBooks()
      fetchDashboardData() // Mettre à jour les statistiques
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la suppression",
        variant: "destructive"
      })
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès"
    })
    navigate('/')
  }

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    if (activeTab === 'books') {
      fetchBooks()
    } else if (activeTab === 'borrowings') {
      fetchBorrowings()
    }
  }, [activeTab, fetchBooks, fetchBorrowings])

  // Fonctions utilitaires pour les emprunts
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const getStatusBadge = (borrowing: Borrowing) => {
    const { current_status, days_overdue } = borrowing
    
    if (current_status === 'overdue') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          En retard ({days_overdue} jour{days_overdue > 1 ? 's' : ''})
        </span>
      )
    } else if (current_status === 'active') {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          Actif
        </span>
      )
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          Retourné
        </span>
      )
    }
  }

  const StatCard = ({ icon: Icon, title, value, change, color, description }: StatCardProps) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm font-medium">{title}</p>
              <p className="text-2xl font-bold text-white mt-1">{value}</p>
              {description && (
                <p className="text-gray-500 text-xs mt-1">{description}</p>
              )}
              <div className={`h-12 w-12 rounded-lg ${color} flex items-center justify-center`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
            </div>
            {change && (
              <div className="mt-4 flex items-center">
                <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
                <span className="text-green-400 text-sm font-medium">+{change}%</span>
                <span className="text-gray-500 text-sm ml-2">ce mois</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <p className="text-gray-900 text-lg">Chargement...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Administration</h1>
                <p className="text-sm text-gray-500">Gestion de la bibliothèque</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
              >
                Retour au site
              </Button>
              <Button
                variant="destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: BarChart3 },
              { id: 'books', label: 'Gestion des livres', icon: BookOpen },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'borrowings', label: 'Emprunts', icon: FileText }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Vue d'ensemble */}
        {activeTab === 'overview' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Vue d'ensemble</h2>
              <Button
                onClick={() => {
                  fetchDashboardData()
                  toast({
                    title: "Actualisation",
                    description: "Statistiques mises à jour"
                  })
                }}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualiser</span>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Users className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.total_users || 0}</p>
                      <p className="text-xs text-gray-500">Utilisateurs inscrits</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <BookOpen className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Livres</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.total_books || 0}</p>
                      <p className="text-xs text-gray-500">Titres dans la collection</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Emprunts actifs</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.active_borrowings || 0}</p>
                      <p className="text-xs text-gray-500">Livres actuellement empruntés</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Retards</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.overdue_borrowings || 0}</p>
                      <p className="text-xs text-gray-500">Emprunts en retard</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Gestion des livres */}
        {activeTab === 'books' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des livres</h2>
              <Button
                onClick={() => setShowAddBookModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un livre
              </Button>
            </div>

            {booksLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des livres...</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Livre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Genre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Année
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quantité
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                         console.log('=== AFFICHAGE DES LIVRES ===')
                         console.log('books array:', books)
                         console.log('books.length:', books.length)
                         return books.map((book, index) => {
                          console.log(`Livre ${index}:`, book)
                          return (
                          <tr key={book.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{book.title}</div>
                                <div className="text-sm text-gray-500">{book.author}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {book.genre}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {book.publication_year}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {book.available_quantity || 0}/{book.total_quantity || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedBook(book)
                                  setNewBook({
                                    title: book.title || '',
                                    author: book.author || '',
                                    genre: book.genre || '',
                                    isbn: book.isbn || '',
                                    publication_year: book.publication_year || '',
                                    total_quantity: book.total_quantity || 1,
                                    description: book.description || ''
                                  })
                                  setCoverImageFile(null)
                                  setCoverImagePreview(null)
                                  setShowEditBookModal(true)
                                }}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Modifier
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteBook(book.id)}
                              >
                                Supprimer
                              </Button>
                            </td>
                          </tr>
                          )
                        })
                        })()}
                        {books.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                              {booksLoading ? 'Chargement...' : 'Aucun livre trouvé. Ajoutez votre premier livre !'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Autres onglets */}
        {activeTab === 'users' && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Gestion des utilisateurs</h2>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-600">Fonctionnalité en développement...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'borrowings' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Gestion des emprunts</h2>
              <Button
                onClick={() => {
                  fetchBorrowings()
                  toast({
                    title: "Actualisation",
                    description: "Liste des emprunts mise à jour"
                  })
                }}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Actualiser</span>
              </Button>
            </div>

            {/* Statistiques rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total emprunts</p>
                      <p className="text-2xl font-bold text-gray-900">{borrowingsStats?.total || borrowings.length}</p>
                      <p className="text-xs text-gray-500">Tous les emprunts</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <Clock className="h-8 w-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Emprunts actifs</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {borrowings.filter(b => b.current_status === 'active').length}
                      </p>
                      <p className="text-xs text-gray-500">En cours</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="h-8 w-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">En retard</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {borrowings.filter(b => b.current_status === 'overdue').length}
                      </p>
                      <p className="text-xs text-gray-500">Dépassent la date limite</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {borrowingsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des emprunts...</p>
              </div>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Utilisateur
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Livre
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date d'emprunt
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date limite
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date de retour
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {(() => {
                         console.log('=== AFFICHAGE DES EMPRUNTS ===')
                         console.log('borrowings array:', borrowings)
                         console.log('borrowings.length:', borrowings.length)
                         return borrowings.map((borrowing, index) => {
                          console.log(`Emprunt ${index}:`, borrowing)
                          return (
                          <tr key={borrowing.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{borrowing.user_name}</div>
                                <div className="text-sm text-gray-500">{borrowing.user_email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{borrowing.title}</div>
                                <div className="text-sm text-gray-500">par {borrowing.author}</div>
                                {borrowing.isbn && (
                                  <div className="text-xs text-gray-400">ISBN: {borrowing.isbn}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(borrowing.borrowed_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatDate(borrowing.due_date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(borrowing)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {borrowing.returned_at ? formatDate(borrowing.returned_at) : '-'}
                            </td>
                          </tr>
                          )
                        })
                        })()}
                        {borrowings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                              {borrowingsLoading ? 'Chargement...' : 'Aucun emprunt trouvé.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pagination (si nécessaire) */}
            {borrowingsStats && borrowingsStats.totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Page {borrowingsStats.page} sur {borrowingsStats.totalPages} 
                    ({borrowingsStats.total} emprunts au total)
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal d'ajout de livre */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Ajouter un livre</h3>
              <button
                onClick={() => {
                  setShowAddBookModal(false)
                  setCoverImageFile(null)
                  setCoverImagePreview(null)
                  setNewBook({
                    title: '',
                    author: '',
                    genre: '',
                    isbn: '',
                    publication_year: '',
                    total_quantity: 1,
                    description: ''
                  })
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleAddBook(newBook)
              }}
              className="space-y-6"
            >
              {/* Ligne 1: Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Titre du livre"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 200 caractères</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auteur <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Nom de l'auteur"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 150 caractères</p>
                </div>
              </div>

              {/* Ligne 2: Genre et ISBN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <Input
                    type="text"
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    placeholder="Ex: Fiction, Science-fiction, Histoire..."
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 50 caractères (optionnel)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN
                  </label>
                  <Input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="Ex: 978-2-123456-78-9"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 20 caractères (optionnel)</p>
                </div>
              </div>

              {/* Ligne 3: Année et Quantité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année de publication <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newBook.publication_year}
                    onChange={(e) => setNewBook({ ...newBook, publication_year: e.target.value })}
                    placeholder="Ex: 2024"
                    min="1901"
                    max="2155"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entre 1901 et 2155</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité totale <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newBook.total_quantity}
                    onChange={(e) => setNewBook({ ...newBook, total_quantity: parseInt(e.target.value) })}
                    placeholder="Ex: 5"
                    min="0"
                    max="1000"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entre 0 et 1000 exemplaires</p>
                </div>
              </div>

              {/* Ligne 4: Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={newBook.description}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Description du livre, résumé..."
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 5000 caractères (optionnel) - {newBook.description.length}/5000
                </p>
              </div>

              {/* Image de couverture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCoverImageFile(file)
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            setCoverImagePreview(e.target?.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                      id="cover-image-upload"
                    />
                    <label
                      htmlFor="cover-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {coverImagePreview ? (
                        <div className="mb-4">
                          <img
                            src={coverImagePreview}
                            alt="Aperçu"
                            className="h-32 w-24 object-cover rounded-lg shadow-md"
                          />
                        </div>
                      ) : (
                        <div className="mb-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        {coverImagePreview ? 'Changer l\'image' : 'Choisir une image'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG jusqu'à 5MB
                      </span>
                    </label>
                    {coverImagePreview && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageFile(null)
                          setCoverImagePreview(null)
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                      >
                        Supprimer l'image
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">Optionnel - Format recommandé: 300x450px</p>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowAddBookModal(false)
                    setCoverImageFile(null)
                    setCoverImagePreview(null)
                    setNewBook({
                      title: '',
                      author: '',
                      genre: '',
                      isbn: '',
                      publication_year: '',
                      total_quantity: 1,
                      description: ''
                    })
                  }}
                  className="px-6 py-2"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
                >
                  Ajouter le livre
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de modification de livre */}
      {showEditBookModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Modifier le livre</h3>
              <button
                onClick={() => {
                  setShowEditBookModal(false)
                  setSelectedBook(null)
                  setCoverImageFile(null)
                  setCoverImagePreview(null)
                  setNewBook({
                    title: '',
                    author: '',
                    genre: '',
                    isbn: '',
                    publication_year: '',
                    total_quantity: 1,
                    description: ''
                  })
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleEditBook(newBook)
              }}
              className="space-y-6"
            >
              {/* Ligne 1: Informations principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Titre <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newBook.title}
                    onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                    placeholder="Titre du livre"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 200 caractères</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Auteur <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={newBook.author}
                    onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                    placeholder="Nom de l'auteur"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 150 caractères</p>
                </div>
              </div>

              {/* Ligne 2: Genre et ISBN */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Genre
                  </label>
                  <Input
                    type="text"
                    value={newBook.genre}
                    onChange={(e) => setNewBook({ ...newBook, genre: e.target.value })}
                    placeholder="Ex: Fiction, Science-fiction, Histoire..."
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 50 caractères (optionnel)</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ISBN
                  </label>
                  <Input
                    type="text"
                    value={newBook.isbn}
                    onChange={(e) => setNewBook({ ...newBook, isbn: e.target.value })}
                    placeholder="Ex: 978-2-123456-78-9"
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Maximum 20 caractères (optionnel)</p>
                </div>
              </div>

              {/* Ligne 3: Année et Quantité */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Année de publication <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newBook.publication_year}
                    onChange={(e) => setNewBook({ ...newBook, publication_year: e.target.value })}
                    placeholder="Ex: 2024"
                    min="1901"
                    max="2155"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entre 1901 et 2155</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité totale <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="number"
                    value={newBook.total_quantity}
                    onChange={(e) => setNewBook({ ...newBook, total_quantity: parseInt(e.target.value) })}
                    placeholder="Ex: 5"
                    min="0"
                    max="1000"
                    required
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Entre 0 et 1000 exemplaires</p>
                </div>
              </div>

              {/* Ligne 4: Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  value={newBook.description || ''}
                  onChange={(e) => setNewBook({ ...newBook, description: e.target.value })}
                  placeholder="Description du livre, résumé..."
                  maxLength={5000}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 5000 caractères (optionnel) - {(newBook.description || '').length}/5000
                </p>
              </div>

              {/* Image de couverture */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCoverImageFile(file)
                          const reader = new FileReader()
                          reader.onload = (e) => {
                            setCoverImagePreview(e.target?.result as string)
                          }
                          reader.readAsDataURL(file)
                        }
                      }}
                      className="hidden"
                      id="edit-cover-image-upload"
                    />
                    <label
                      htmlFor="edit-cover-image-upload"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      {coverImagePreview || selectedBook.cover_image ? (
                        <div className="mb-4">
                          <img
                            src={coverImagePreview || selectedBook.cover_image}
                            alt="Aperçu"
                            className="h-32 w-24 object-cover rounded-lg shadow-md"
                          />
                        </div>
                      ) : (
                        <div className="mb-4">
                          <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            stroke="currentColor"
                            fill="none"
                            viewBox="0 0 48 48"
                          >
                            <path
                              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                              strokeWidth={2}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                      <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                        {(coverImagePreview || selectedBook.cover_image) ? 'Changer l\'image' : 'Choisir une image'}
                      </span>
                      <span className="text-xs text-gray-500 mt-1">
                        PNG, JPG, JPEG jusqu'à 5MB
                      </span>
                    </label>
                    {(coverImagePreview || selectedBook.cover_image) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImageFile(null)
                          setCoverImagePreview(null)
                        }}
                        className="mt-2 text-sm text-red-600 hover:text-red-500"
                      >
                        {coverImagePreview ? 'Supprimer la nouvelle image' : 'Supprimer l\'image actuelle'}
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedBook.cover_image && !coverImagePreview 
                    ? 'Image actuelle - Choisissez une nouvelle image pour la remplacer' 
                    : 'Optionnel - Format recommandé: 300x450px'
                  }
                </p>
              </div>

              {/* Boutons d'action */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditBookModal(false)
                    setSelectedBook(null)
                    setCoverImageFile(null)
                    setCoverImagePreview(null)
                    setNewBook({
                      title: '',
                      author: '',
                      genre: '',
                      isbn: '',
                      publication_year: '',
                      total_quantity: 1,
                      description: ''
                    })
                  }}
                  className="px-6 py-2"
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 px-8 py-2"
                >
                  Modifier le livre
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
