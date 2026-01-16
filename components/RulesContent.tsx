'use client'

import { motion } from 'framer-motion'
import { MapPin, Users, Trophy, Target, Clock, Award, Radio, Sparkles, Gamepad2 } from 'lucide-react'
import Link from 'next/link'
import { Button } from './ui/Button'
import { Card } from './ui/Card'

export function RulesContent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-primary-50 py-12 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-extrabold mb-4 gradient-text">
            📜 Règles du Jeu
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Guide complet pour créer et jouer à SnapChasse
          </p>
          <Link href="/dashboard">
            <Button variant="primary" size="lg">
              <Gamepad2 className="w-5 h-5 mr-2" />
              Commencer à jouer
            </Button>
          </Link>
        </motion.div>

        <div className="space-y-8">
          {/* Comment jouer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8 text-primary-500" />
                <h2 className="text-3xl font-bold text-gray-900">Comment Jouer ?</h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Choisissez un jeu</h3>
                    <p className="text-gray-700">
                      Parcourez les jeux disponibles dans le dashboard et sélectionnez celui que vous voulez jouer.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Activez votre géolocalisation</h3>
                    <p className="text-gray-700">
                      Autorisez l&apos;accès à votre position GPS pour suivre votre progression en temps réel.
                      Le système vous guide comme les AirPods : plus vous vous approchez, plus l&apos;indicateur s&apos;intensifie !
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Résolvez les énigmes</h3>
                    <p className="text-gray-700">
                      Suivez les indices et répondez aux questions pour valider chaque étape.
                      Plus vous êtes rapide, plus vous gagnez de points !
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Terminez le parcours</h3>
                    <p className="text-gray-700">
                      Complétez toutes les étapes pour terminer le jeu et voir votre score final dans le classement !
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Fonctionnalités uniques */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-accent-500" />
                <h2 className="text-3xl font-bold text-gray-900">Fonctionnalités Uniques</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-5 bg-primary-50 rounded-xl border-2 border-primary-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Radio className="w-6 h-6 text-primary-600" />
                    <h3 className="text-lg font-bold text-primary-900">Feedback de Proximité</h3>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Comme les AirPods, un système audio et visuel vous guide vers votre cible.
                    Plus vous vous approchez, plus les bips deviennent fréquents et les indicateurs s&apos;intensifient !
                  </p>
                </div>

                <div className="p-5 bg-accent-50 rounded-xl border-2 border-accent-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Users className="w-6 h-6 text-accent-600" />
                    <h3 className="text-lg font-bold text-accent-900">Parties Multi-Joueur</h3>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Créez des sessions privées et invitez vos amis avec un code unique.
                    Compétissez en temps réel avec un classement synchronisé !
                  </p>
                </div>

                <div className="p-5 bg-purple-50 rounded-xl border-2 border-purple-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Trophy className="w-6 h-6 text-purple-600" />
                    <h3 className="text-lg font-bold text-purple-900">Classement en Direct</h3>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Suivez les scores de tous les joueurs en temps réel.
                    Le classement se met à jour automatiquement pendant la partie !
                  </p>
                </div>

                <div className="p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Award className="w-6 h-6 text-yellow-600" />
                    <h3 className="text-lg font-bold text-yellow-900">Achievements & Badges</h3>
                  </div>
                  <p className="text-gray-700 text-sm">
                    Débloquez des achievements en réalisant des défis.
                    Collectionnez des badges pour montrer vos compétences !
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Comment créer un jeu */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <MapPin className="w-8 h-8 text-primary-500" />
                <h2 className="text-3xl font-bold text-gray-900">Comment Créer un Jeu ?</h2>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Créez votre jeu</h3>
                    <p className="text-gray-700">
                      Cliquez sur &quot;Créer un jeu&quot; dans le dashboard et donnez un titre et une description à votre parcours.
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Ajoutez des étapes</h3>
                    <p className="text-gray-700">
                      Pour chaque étape :
                    </p>
                    <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                      <li>Définissez un titre et une description</li>
                      <li>Créez une énigme/question</li>
                      <li>Indiquez la réponse attendue (non sensible à la casse)</li>
                      <li>Définissez l&apos;emplacement géographique (latitude/longitude)</li>
                      <li>Choisissez le rayon de validation (10-1000 mètres)</li>
                    </ul>
                    <p className="text-gray-700 mt-3">
                      💡 <strong>Astuce :</strong> Utilisez &quot;Activer GPS&quot; pour utiliser votre position actuelle !
                    </p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-accent-100 text-accent-700 flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">Publiez et partagez</h3>
                    <p className="text-gray-700">
                      Une fois créé, votre jeu est automatiquement publié.
                      Vous pouvez le partager ou créer une session multi-joueur pour inviter vos amis !
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Système de scoring */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card variant="elevated" className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="w-8 h-8 text-accent-500" />
                <h2 className="text-3xl font-bold text-gray-900">Système de Scoring</h2>
              </div>

              <div className="space-y-4">
                <div className="p-5 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl border-2 border-primary-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Calcul des points</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li><strong>Réponse correcte :</strong> Points de base selon la difficulté</li>
                    <li><strong>Bonus vitesse :</strong> Plus vous répondez rapidement, plus vous gagnez de points</li>
                    <li><strong>Bonus proximité :</strong> Points supplémentaires si vous êtes proche de l&apos;emplacement cible</li>
                  </ul>
                </div>

                <div className="p-5 bg-yellow-50 rounded-xl border-2 border-yellow-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Classement</h3>
                  <p className="text-gray-700">
                    Le classement est basé sur :
                  </p>
                  <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1">
                    <li><strong>Score total</strong> (principal critère)</li>
                    <li><strong>Temps total</strong> (départage en cas d&apos;égalité - le plus rapide gagne)</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Conseils */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card variant="elevated" className="p-8 bg-gradient-to-br from-primary-50 to-accent-50">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="w-8 h-8 text-primary-600" />
                <h2 className="text-3xl font-bold text-gray-900">💡 Conseils Pro</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-white/80 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Pour les Joueurs</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Utilisez le feedback de proximité pour vous orienter</li>
                    <li>• Répondez rapidement pour maximiser vos points</li>
                    <li>• Rejoignez des sessions multi-joueur pour plus de fun</li>
                    <li>• Collectionnez les achievements pour débloquer des badges</li>
                  </ul>
                </div>

                <div className="p-4 bg-white/80 rounded-lg">
                  <h3 className="font-bold text-gray-900 mb-2">Pour les Créateurs</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Variez la difficulté des énigmes</li>
                    <li>• Testez vos jeux avant de les partager</li>
                    <li>• Utilisez des emplacements intéressants et accessibles</li>
                    <li>• Ajustez le rayon de validation selon la précision nécessaire</li>
                  </ul>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center pt-8"
          >
            <Link href="/dashboard">
              <Button variant="primary" size="lg" className="mr-4">
                <Gamepad2 className="w-5 h-5 mr-2" />
                Commencer à jouer
              </Button>
            </Link>
            <Link href="/dashboard/create">
              <Button variant="secondary" size="lg">
                <MapPin className="w-5 h-5 mr-2" />
                Créer un jeu
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
