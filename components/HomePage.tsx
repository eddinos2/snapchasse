'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { MapPin, Puzzle, Users, Sparkles } from 'lucide-react'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1],
    },
  },
}

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-purple-50 opacity-50" />
      
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-6xl mx-auto relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="inline-block mb-6"
        >
          <Sparkles className="w-12 h-12 text-primary-500 mx-auto animate-float" />
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-6xl md:text-display font-extrabold mb-6 gradient-text"
        >
          SnapChasse
        </motion.h1>
        
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl mb-4 text-gray-600 font-medium"
        >
          Créez et participez à des jeux de piste
        </motion.p>

        <motion.p
          variants={itemVariants}
          className="text-lg md:text-xl mb-12 text-gray-500"
        >
          Géolocalisés • Interactifs • Amusants
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
        >
          <Link href="/dashboard">
            <Button variant="primary" size="lg" className="w-full sm:w-auto glow-effect">
              Explorer les jeux
            </Button>
          </Link>
          <Link href="/dashboard/create">
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              Créer un jeu
            </Button>
          </Link>
          <Link href="/rules">
            <Button variant="ghost" size="lg" className="w-full sm:w-auto">
              📜 Règles du jeu
            </Button>
          </Link>
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          <FeatureCard
            icon={MapPin}
            title="Géolocalisation"
            description="Suivez votre progression en temps réel avec précision"
            delay={0}
            color="primary"
          />
          <FeatureCard
            icon={Puzzle}
            title="Énigmes"
            description="Résolvez des défis créatifs pour avancer dans votre parcours"
            delay={0.1}
            color="accent"
          />
          <FeatureCard
            icon={Users}
            title="Communauté"
            description="Partagez vos créations et défiez d'autres joueurs"
            delay={0.2}
            color="purple"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

function FeatureCard({ 
  icon: Icon,
  title, 
  description,
  delay = 0,
  color = 'primary'
}: { 
  icon: any
  title: string
  description: string
  delay?: number
  color?: 'primary' | 'accent' | 'purple'
}) {
  const colorClasses = {
    primary: 'text-primary-500 bg-primary-50',
    accent: 'text-accent-500 bg-accent-50',
    purple: 'text-purple-500 bg-purple-50',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: [0.4, 0, 0.2, 1] }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Card variant="elevated" interactive className="p-8 h-full text-center">
        <div className={`w-16 h-16 rounded-2xl ${colorClasses[color]} flex items-center justify-center mx-auto mb-4`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-600 leading-relaxed">{description}</p>
      </Card>
    </motion.div>
  )
}
