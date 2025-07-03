import { Info, Shield, User, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface RoleInfo {
  domain: string
  role: 'admin' | 'student'
  description: string
}

const ROLE_MAPPING: RoleInfo[] = [
  {
    domain: '@admin.2ie.edu',
    role: 'admin',
    description: 'Personnel administratif 2iE'
  },
  {
    domain: '@direction.2ie.edu',
    role: 'admin',
    description: 'Direction 2iE'
  },
  {
    domain: '@staff.2ie.edu',
    role: 'admin',
    description: 'Personnel 2iE'
  },
  {
    domain: '@bibliotheque.2ie.edu',
    role: 'admin',
    description: 'Personnel bibliothèque'
  },
  {
    domain: '@biblio.com',
    role: 'admin',
    description: 'Administration système'
  },
  {
    domain: '@etu.2ie-edu.org',
    role: 'student',
    description: 'Étudiants 2iE'
  },
  {
    domain: '@student.2ie.edu',
    role: 'student',
    description: 'Étudiants 2iE (alt)'
  },
  {
    domain: '@2ie.edu',
    role: 'student',
    description: 'Communauté étudiante 2iE'
  },
  {
    domain: 'Autres domaines',
    role: 'student',
    description: 'Emails externes (Gmail, Yahoo, etc.)'
  }
]

export const RoleInfoComponent = () => {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="w-5 h-5 text-blue-600" />
          <span>Attribution automatique des rôles</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Votre rôle est déterminé automatiquement en fonction du domaine de votre adresse email.
            Vous ne pouvez pas choisir votre rôle manuellement.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Correspondance domaines / rôles :</h4>
          
          <div className="grid gap-2">
            {ROLE_MAPPING.map((mapping, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  {mapping.role === 'admin' ? (
                    <Shield className="w-4 h-4 text-purple-600" />
                  ) : (
                    <User className="w-4 h-4 text-blue-600" />
                  )}
                  <div>
                    <span className="font-mono text-sm font-medium">
                      {mapping.domain}
                    </span>
                    <p className="text-xs text-gray-600">
                      {mapping.description}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant={mapping.role === 'admin' ? 'destructive' : 'secondary'}
                  className={
                    mapping.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800 border-purple-200' 
                      : 'bg-blue-100 text-blue-800 border-blue-200'
                  }
                >
                  {mapping.role === 'admin' ? 'Administrateur' : 'Étudiant'}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-start space-x-2">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-1">Comment ça fonctionne :</p>
              <ul className="space-y-1 text-xs">
                <li>• Le système analyse automatiquement votre adresse email</li>
                <li>• Votre rôle est attribué selon le domaine détecté</li>
                <li>• Cette attribution est automatique et ne peut pas être modifiée manuellement</li>
                <li>• Si vous changez d'email, votre rôle sera mis à jour à la prochaine connexion</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default RoleInfoComponent
