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
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showAddBookModal, setShowAddBookModal] = useState(false)
  const [addBookLoading, setAddBookLoading] = useState(false)
  const [addBookError, setAddBookError] = useState('')
  const [addBookSuccess, setAddBookSuccess] = useState('')
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    publication_year: '',
    total_quantity: 1,
    description: ''
  })
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null)
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      // Simuler l'appel API - remplacer par vos vraies API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Données simulées basées sur votre structure de BDD
      const mockStats: DashboardStats = {
        total_users: 245,
        total_books: 1847,
        total_borrowings: 3456,
        active_borrowings: 89,
        overdue_borrowings: 12,
        pending_reviews: 23,
        new_users_this_month: 31,
        books_borrowed_this_month: 187,
        total_reviews: 456,
        average_rating: 4.3
      }

      const mockActivities: RecentActivity[] = [
        {
          id: 1,
          type: 'borrowing',
          message: 'Jean Dupont a emprunté "Le Petit Prince"',
          timestamp: '2024-12-27T10:30:00Z',
          user: 'Jean Dupont'
        },
        {
          id: 2,
          type: 'return',
          message: 'Marie Martin a retourné "1984"',
          timestamp: '2024-12-27T09:15:00Z',
          user: 'Marie Martin'
        },
        {
          id: 3,
          type: 'user_registration',
          message: 'Nouvel utilisateur inscrit : Ahmed Sow',
          timestamp: '2024-12-27T08:45:00Z',
          user: 'Ahmed Sow'
        },
        {
          id: 4,
          type: 'review_added',
          message: 'Nouvel avis ajouté sur "Les Misérables"',
          timestamp: '2024-12-26T16:20:00Z'
        }
      ]

      setStats(mockStats)
      setRecentActivities(mockActivities)
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les données du dashboard",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const quickActions: QuickAction[] = [
    {
      icon: Plus,
      label: "Ajouter un livre",
      description: "Nouveau livre au catalogue",
      action: () => setActiveTab('books'),
      variant: 'default',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      icon: Users,
      label: "Gérer utilisateurs",
      description: "Administration des comptes",
      action: () => setActiveTab('users'),
      variant: 'outline',
      color: 'border-green-600 text-green-400 hover:bg-green-600/10'
    },
    {
      icon: Star,
      label: "Modérer avis",
      description: `${stats?.pending_reviews || 0} en attente`,
      action: () => setActiveTab('reviews'),
      variant: 'outline',
      color: 'border-yellow-600 text-yellow-400 hover:bg-yellow-600/10'
    },
    {
      icon: AlertTriangle,
      label: "Retards",
      description: `${stats?.overdue_borrowings || 0} emprunts en retard`,
      action: () => setActiveTab('borrowings'),
      variant: 'destructive',
      color: 'bg-red-600 hover:bg-red-700'
    }
  ]

  const handleLogout = () => {
    localStorage.clear()
    toast({
      title: "Déconnexion",
      description: "Vous avez été déconnecté avec succès"
    })
    navigate('/')
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
            </div>
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
        </CardContent>
      </Card>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="h-16 w-16 bg-blue-600 rounded-full flex items-center justify-center mb-4 mx-auto animate-pulse">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <p className="text-white text-lg">Chargement du dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Interface d'administration</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        className="fixed left-0 top-0 z-50 h-full w-64 bg-gray-900/95 backdrop-blur-sm border-r border-gray-700 lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-white font-semibold">Admin 2iE</h1>
                <p className="text-gray-400 text-xs">Bibliothèque</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
              { id: 'books', label: 'Livres', icon: BookOpen },
              { id: 'users', label: 'Utilisateurs', icon: Users },
              { id: 'borrowings', label: 'Emprunts', icon: FileText },
              { id: 'reviews', label: 'Avis', icon: Star },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'settings', label: 'Paramètres', icon: Settings }
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'secondary' : 'ghost'}
                className={`w-full justify-start ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'text-gray-300 hover:text-white hover:bg-gray-800'
                }`}
                onClick={() => {
                  setActiveTab(item.id)
                  setSidebarOpen(false)
                }}
              >
                <item.icon className="h-4 w-4 mr-3" />
                {item.label}
              </Button>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700">
            <Button
              variant="ghost"
              className="w-full justify-start text-gray-300 hover:text-white hover:bg-red-600/20"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-3" />
              Déconnexion
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <div className="sticky top-0 z-30 flex h-16 items-center justify-between bg-gray-900/95 backdrop-blur-sm border-b border-gray-700 px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-400 hover:text-white"
            >
              <Menu className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-white">
                {activeTab === 'dashboard' && 'Dashboard'}
                {activeTab === 'books' && 'Gestion des Livres'}
                {activeTab === 'users' && 'Gestion des Utilisateurs'}
                {activeTab === 'borrowings' && 'Gestion des Emprunts'}
                {activeTab === 'reviews' && 'Modération des Avis'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'settings' && 'Paramètres'}
              </h1>
              <p className="text-gray-400 text-sm">Interface d'administration</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher..."
                className="pl-10 bg-gray-800 border-gray-600 text-white w-64"
              />
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchDashboardData}
              className="text-gray-400 hover:text-white"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-400 hover:text-white"
              >
                <Bell className="h-4 w-4" />
              </Button>
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={Users}
                  title="Utilisateurs Total"
                  value={stats?.total_users || 0}
                  change={12}
                  color="bg-blue-600"
                  description={`+${stats?.new_users_this_month} ce mois`}
                />
                <StatCard
                  icon={BookOpen}
                  title="Livres au Catalogue"
                  value={stats?.total_books || 0}
                  color="bg-green-600"
                  description="Collection complète"
                />
                <StatCard
                  icon={FileText}
                  title="Emprunts Actifs"
                  value={stats?.active_borrowings || 0}
                  color="bg-yellow-600"
                  description={`${stats?.books_borrowed_this_month} ce mois`}
                />
                <StatCard
                  icon={AlertTriangle}
                  title="Retards"
                  value={stats?.overdue_borrowings || 0}
                  color="bg-red-600"
                  description="Nécessitent attention"
                />
              </div>

              {/* Secondary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={Star}
                  title="Avis en Attente"
                  value={stats?.pending_reviews || 0}
                  color="bg-purple-600"
                  description="À modérer"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Note Moyenne"
                  value={stats?.average_rating?.toFixed(1) || '0.0'}
                  color="bg-indigo-600"
                  description={`${stats?.total_reviews} avis total`}
                />
                <StatCard
                  icon={Activity}
                  title="Total Emprunts"
                  value={stats?.total_borrowings || 0}
                  color="bg-pink-600"
                  description="Historique complet"
                />
              </div>

              {/* Quick Actions */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Actions Rapides
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                      <motion.div
                        key={index}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Button
                          variant={action.variant}
                          className={`w-full h-auto p-4 flex-col space-y-2 ${action.color}`}
                          onClick={action.action}
                        >
                          <action.icon className="h-6 w-6" />
                          <div className="text-center">
                            <div className="font-medium">{action.label}</div>
                            <div className="text-xs opacity-80">{action.description}</div>
                          </div>
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activities */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Activités Récentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentActivities.map((activity) => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-4 p-3 rounded-lg bg-gray-700/30 hover:bg-gray-700/50 transition-colors"
                      >
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          activity.type === 'borrowing' ? 'bg-blue-600' :
                          activity.type === 'return' ? 'bg-green-600' :
                          activity.type === 'user_registration' ? 'bg-purple-600' :
                          'bg-yellow-600'
                        }`}>
                          {activity.type === 'borrowing' && <FileText className="h-4 w-4 text-white" />}
                          {activity.type === 'return' && <CheckCircle className="h-4 w-4 text-white" />}
                          {activity.type === 'user_registration' && <Users className="h-4 w-4 text-white" />}
                          {activity.type === 'review_added' && <Star className="h-4 w-4 text-white" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-white text-sm">{activity.message}</p>
                          <p className="text-gray-400 text-xs">
                            {new Date(activity.timestamp).toLocaleString('fr-FR')}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="books">
              <div className="text-center py-20">
                <BookOpen className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Gestion des Livres</h3>
                <p className="text-gray-400 mb-6">Ajoutez un nouveau livre au catalogue</p>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setShowAddBookModal(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un livre
                </Button>
              </div>
              {/* Modale d'ajout de livre */}
              <Dialog open={showAddBookModal} onOpenChange={setShowAddBookModal}>
                <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/60 backdrop-blur-sm">
                  <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl shadow-2xl p-8 max-w-md w-full relative border border-gray-700 max-h-[90vh] overflow-y-auto">
                    <button className="absolute top-3 right-3 text-gray-400 hover:text-white text-2xl transition" onClick={() => {
                      setShowAddBookModal(false)
                      setAddBookError('')
                      setAddBookSuccess('')
                      setNewBook({ title: '', author: '', genre: '', isbn: '', publication_year: '', total_quantity: 1, description: '' })
                      setCoverImageFile(null)
                      setCoverImagePreview(null)
                    }}>✕</button>
                    <div className="flex flex-col items-center mb-6">
                      <div className="bg-blue-600 rounded-full p-3 mb-2 shadow-lg">
                        <Plus className="h-7 w-7 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-1">Ajouter un livre</h2>
                      <p className="text-gray-400 text-sm">Remplissez les informations du livre à ajouter</p>
                    </div>
                    <form
                      onSubmit={async e => {
                        e.preventDefault()
                        setAddBookLoading(true)
                        setAddBookError('')
                        setAddBookSuccess('')
                        if (!newBook.title || !newBook.author || !newBook.genre || !newBook.isbn || !newBook.publication_year) {
                          setAddBookError('Tous les champs obligatoires doivent être remplis.')
                          setAddBookLoading(false)
                          return
                        }
                        try {
                          const token = localStorage.getItem('token')
                          if (!token) {
                            setAddBookError('Vous devez être connecté en tant qu\'admin.')
                            setAddBookLoading(false)
                            return
                          }
                          // Préparer le FormData
                          const formData = new FormData()
                          Object.entries(newBook).forEach(([key, value]) => {
                            if (value !== '' && value !== undefined && value !== null) {
                              if (key === 'publication_year' || key === 'total_quantity') {
                                formData.append(key, String(value))
                              } else {
                                formData.append(key, value as string)
                              }
                            }
                          })
                          if (coverImageFile) {
                            formData.append('cover_image', coverImageFile)
                          }
                          const res = await fetch('http://localhost:5000/api/books', {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${token}`
                            },
                            body: formData
                          })
                          const data = await res.json()
                          if (!res.ok || !data.success) {
                            let errorMsg = data.message || data.error || 'Erreur lors de l\'ajout du livre'
                            if (data.errors && Array.isArray(data.errors)) {
                              errorMsg += '\n' + data.errors.map((err: { msg: string }) => `- ${err.msg}`).join('\n')
                            }
                            setAddBookError(errorMsg)
                            setAddBookLoading(false)
                            return
                          }
                          setAddBookSuccess('Livre ajouté avec succès !')
                          setTimeout(() => setShowAddBookModal(false), 1200)
                          setNewBook({ title: '', author: '', genre: '', isbn: '', publication_year: '', total_quantity: 1, description: '' })
                          setCoverImageFile(null)
                          setCoverImagePreview(null)
                        } catch (e) {
                          setAddBookError(e instanceof Error ? e.message : 'Erreur lors de l\'ajout du livre')
                        } finally {
                          setAddBookLoading(false)
                        }
                      }}
                      encType="multipart/form-data"
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Titre</label>
                        <input type="text" className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition" value={newBook.title} onChange={e => setNewBook({ ...newBook, title: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Auteur</label>
                        <input type="text" className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition" value={newBook.author} onChange={e => setNewBook({ ...newBook, author: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Genre</label>
                        <input type="text" className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition" value={newBook.genre} onChange={e => setNewBook({ ...newBook, genre: e.target.value })} required />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">ISBN</label>
                        <input type="text" className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition" value={newBook.isbn} onChange={e => setNewBook({ ...newBook, isbn: e.target.value })} required />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-200 mb-1">Année</label>
                          <input type="number" className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition" value={newBook.publication_year} onChange={e => setNewBook({ ...newBook, publication_year: e.target.value })} required min="1000" max="2100" />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-200 mb-1">Quantité</label>
                          <input type="number" className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition" value={newBook.total_quantity} onChange={e => setNewBook({ ...newBook, total_quantity: Number(e.target.value) })} required min="1" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Description <span className="text-gray-400">(optionnel)</span></label>
                        <textarea className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition" value={newBook.description} onChange={e => setNewBook({ ...newBook, description: e.target.value })} rows={2} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-200 mb-1">Image de couverture <span className="text-gray-400">(optionnel)</span></label>
                        <input
                          type="file"
                          accept="image/*"
                          className="border border-gray-700 bg-gray-900 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-600 transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                          onChange={e => {
                            const file = e.target.files?.[0] || null
                            setCoverImageFile(file)
                            if (file) {
                              const reader = new FileReader()
                              reader.onloadend = () => setCoverImagePreview(reader.result as string)
                              reader.readAsDataURL(file)
                            } else {
                              setCoverImagePreview(null)
                            }
                          }}
                        />
                        {coverImagePreview && (
                          <div className="mt-3 flex flex-col items-center">
                            <img src={coverImagePreview} alt="Aperçu couverture" className="rounded-xl shadow-lg border-2 border-blue-600 w-32 h-40 object-cover" />
                            <span className="text-xs text-gray-400 mt-1">Aperçu</span>
                          </div>
                        )}
                      </div>
                      {addBookError && <div className="text-red-500 bg-red-100 border border-red-400 rounded-lg px-3 py-2 text-sm whitespace-pre-line">{addBookError}</div>}
                      {addBookSuccess && <div className="text-green-500 bg-green-100 border border-green-400 rounded-lg px-3 py-2 text-sm">{addBookSuccess}</div>}
                      <div className="flex justify-center mt-6">
                        <Button
                          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold py-3 px-10 rounded-2xl shadow-xl hover:scale-105 hover:from-green-500 hover:to-blue-700 transition-all text-lg disabled:opacity-60 border-2 border-blue-700"
                          type="submit"
                          disabled={addBookLoading}
                        >
                          <CheckCircle className="h-5 w-5 text-white" />
                          {addBookLoading ? 'Ajout en cours...' : 'Valider'}
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
