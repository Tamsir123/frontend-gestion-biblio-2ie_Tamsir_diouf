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
                <p className="text-gray-400 mb-6">Interface de gestion du catalogue à venir</p>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un livre
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="users">
              <div className="text-center py-20">
                <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Gestion des Utilisateurs</h3>
                <p className="text-gray-400 mb-6">Interface de gestion des comptes à venir</p>
                <Button className="bg-green-600 hover:bg-green-700">
                  <Eye className="h-4 w-4 mr-2" />
                  Voir tous les utilisateurs
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="borrowings">
              <div className="text-center py-20">
                <FileText className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Gestion des Emprunts</h3>
                <p className="text-gray-400 mb-6">Interface de suivi des emprunts à venir</p>
                <Button className="bg-yellow-600 hover:bg-yellow-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Voir les retards
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="text-center py-20">
                <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Modération des Avis</h3>
                <p className="text-gray-400 mb-6">Interface de modération des commentaires à venir</p>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  <Star className="h-4 w-4 mr-2" />
                  Modérer les avis
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="text-center py-20">
                <Bell className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Notifications</h3>
                <p className="text-gray-400 mb-6">Système de notifications à venir</p>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Bell className="h-4 w-4 mr-2" />
                  Créer une notification
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <div className="text-center py-20">
                <Settings className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Paramètres</h3>
                <p className="text-gray-400 mb-6">Configuration du système à venir</p>
                <Button className="bg-gray-600 hover:bg-gray-700">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurer
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard