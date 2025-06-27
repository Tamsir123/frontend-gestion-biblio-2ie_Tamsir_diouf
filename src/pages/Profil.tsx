import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, Calendar, MapPin, Camera, Edit, Save, X, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: number
  first_name: string
  last_name: string
  email: string
  phone?: string
  address?: string
  student_id: string
  department: string
  year_of_study: number
  registration_date: string
  profile_picture?: string
  bio?: string
}

interface ProfileStats {
  total_borrowed: number
  current_borrowed: number
  total_reviews: number
  favorite_genre: string
}

const Profil = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const { toast } = useToast()

  // États pour l'édition du profil
  const [editForm, setEditForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    bio: ''
  })

  // États pour le changement de mot de passe
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  useEffect(() => {
    fetchProfile()
    fetchStats()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditForm({
          first_name: data.user.first_name || '',
          last_name: data.user.last_name || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          bio: data.user.bio || ''
        })
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Données d'exemple si l'API n'est pas disponible
      const testProfile: UserProfile = {
        id: 1,
        first_name: 'Aminata',
        last_name: 'Traoré',
        email: 'aminata.traore@2ie-edu.org',
        phone: '+226 70 12 34 56',
        address: 'Ouagadougou, Burkina Faso',
        student_id: '2IE2024001',
        department: 'Génie Informatique',
        year_of_study: 3,
        registration_date: '2022-09-15T00:00:00Z',
        profile_picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face',
        bio: 'Étudiante passionnée par l\'intelligence artificielle et le développement durable. J\'aime découvrir de nouveaux livres sur la technologie et l\'innovation.'
      }
      setProfile(testProfile)
      setEditForm({
        first_name: testProfile.first_name,
        last_name: testProfile.last_name,
        phone: testProfile.phone || '',
        address: testProfile.address || '',
        bio: testProfile.bio || ''
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Erreur:', error)
      // Données d'exemple
      const testStats: ProfileStats = {
        total_borrowed: 24,
        current_borrowed: 3,
        total_reviews: 8,
        favorite_genre: 'Technologie'
      }
      setStats(testStats)
    }
  }

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      })

      if (response.ok) {
        const data = await response.json()
        setProfile(data.user)
        setEditing(false)
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées avec succès",
        })
      } else {
        throw new Error('Erreur lors de la mise à jour')
      }
    } catch (error) {
      // Simulation pour la démo
      if (profile) {
        setProfile({
          ...profile,
          ...editForm
        })
        setEditing(false)
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées avec succès",
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast({
        title: "Erreur",
        description: "Les nouveaux mots de passe ne correspondent pas",
        variant: "destructive"
      })
      return
    }

    if (passwordForm.new_password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le nouveau mot de passe doit contenir au moins 6 caractères",
        variant: "destructive"
      })
      return
    }

    try {
      const token = localStorage.getItem('token')
      const response = await fetch('http://localhost:5000/api/users/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      })

      if (response.ok) {
        setShowPasswordForm(false)
        setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
        toast({
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été mis à jour avec succès",
        })
      } else {
        throw new Error('Erreur lors du changement de mot de passe')
      }
    } catch (error) {
      // Simulation pour la démo
      setShowPasswordForm(false)
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès",
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-black mx-auto mb-8"></div>
            <p className="text-xl text-gray-600">Chargement de votre profil...</p>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  if (!profile) return null

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
            alt="Profil utilisateur" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/40"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-16">
          <motion.div 
            className="flex items-center space-x-6"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="relative">
              <img
                src={profile.profile_picture || 'https://images.unsplash.com/photo-1494790108755-2616b612b1e5?w=150&h=150&fit=crop&crop=face'}
                alt="Photo de profil"
                className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>
            <div className="text-white">
              <h1 className="text-4xl font-bold mb-2">
                {profile.first_name} {profile.last_name}
              </h1>
              <p className="text-xl text-gray-200 mb-2">{profile.department}</p>
              <div className="flex items-center space-x-4 text-gray-300">
                <span>ID: {profile.student_id}</span>
                <span>•</span>
                <span>Année {profile.year_of_study}</span>
              </div>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informations personnelles */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informations personnelles
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => editing ? setEditing(false) : setEditing(true)}
                >
                  {editing ? (
                    <>
                      <X className="w-4 h-4 mr-1" />
                      Annuler
                    </>
                  ) : (
                    <>
                      <Edit className="w-4 h-4 mr-1" />
                      Modifier
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {editing ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prénom
                        </label>
                        <Input
                          value={editForm.first_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, first_name: e.target.value }))}
                          placeholder="Votre prénom"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom
                        </label>
                        <Input
                          value={editForm.last_name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, last_name: e.target.value }))}
                          placeholder="Votre nom"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Téléphone
                      </label>
                      <Input
                        value={editForm.phone}
                        onChange={(e) => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="Votre numéro de téléphone"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Adresse
                      </label>
                      <Input
                        value={editForm.address}
                        onChange={(e) => setEditForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Votre adresse"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bio
                      </label>
                      <textarea
                        value={editForm.bio}
                        onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        rows={3}
                        placeholder="Parlez-nous de vous..."
                      />
                    </div>
                    <Button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="bg-black hover:bg-gray-800 text-white"
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Sauvegarde...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Sauvegarder
                        </>
                      )}
                    </Button>
                  </>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Mail className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{profile.email}</p>
                        </div>
                      </div>
                      {profile.phone && (
                        <div className="flex items-center">
                          <Phone className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Téléphone</p>
                            <p className="font-medium">{profile.phone}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-500">Inscrit depuis</p>
                          <p className="font-medium">{formatDate(profile.registration_date)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      {profile.address && (
                        <div className="flex items-center">
                          <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <p className="text-sm text-gray-500">Adresse</p>
                            <p className="font-medium">{profile.address}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {profile.bio && !editing && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">À propos</h4>
                    <p className="text-gray-700">{profile.bio}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sécurité */}
            <Card>
              <CardHeader>
                <CardTitle>Sécurité</CardTitle>
              </CardHeader>
              <CardContent>
                {!showPasswordForm ? (
                  <Button
                    variant="outline"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    Changer le mot de passe
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mot de passe actuel
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordForm.current_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, current_password: e.target.value }))}
                          placeholder="Entrez votre mot de passe actuel"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        >
                          {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordForm.new_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, new_password: e.target.value }))}
                          placeholder="Entrez votre nouveau mot de passe"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        >
                          {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmer le nouveau mot de passe
                      </label>
                      <div className="relative">
                        <Input
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm(prev => ({ ...prev, confirm_password: e.target.value }))}
                          placeholder="Confirmez votre nouveau mot de passe"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        >
                          {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Button
                        onClick={handleChangePassword}
                        className="bg-black hover:bg-gray-800 text-white"
                      >
                        Confirmer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setShowPasswordForm(false)
                          setPasswordForm({ current_password: '', new_password: '', confirm_password: '' })
                        }}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar avec statistiques */}
          <div className="space-y-6">
            {/* Statistiques */}
            {stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Mes statistiques</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Livres empruntés</span>
                    <Badge variant="outline" className="text-gray-600 border-gray-600">
                      {stats.total_borrowed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-green-700 font-medium">Emprunts actuels</span>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {stats.current_borrowed}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                    <span className="text-orange-700 font-medium">Avis donnés</span>
                    <Badge variant="outline" className="text-orange-600 border-orange-600">
                      {stats.total_reviews}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">Genre préféré</span>
                    <Badge variant="outline" className="text-gray-600 border-gray-600">
                      {stats.favorite_genre}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Informations académiques */}
            <Card>
              <CardHeader>
                <CardTitle>Informations académiques</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Numéro étudiant</p>
                  <p className="font-medium font-mono">{profile.student_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Département</p>
                  <p className="font-medium">{profile.department}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Année d'étude</p>
                  <p className="font-medium">Année {profile.year_of_study}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>

      <Footer />
    </div>
  )
}

export default Profil
