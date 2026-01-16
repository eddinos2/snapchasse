'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

export function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl mx-auto"
      >
        <motion.h1
          className="text-6xl md:text-8xl font-bold mb-6 retro-glow"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          SnapChasse
        </motion.h1>
        
        <motion.p
          className="text-xl md:text-2xl mb-12 text-retro-secondary"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          Créez et participez à des jeux de piste géolocalisés
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Link
            href="/auth/signin"
            className="px-8 py-4 bg-retro-primary text-retro-dark font-bold rounded-lg hover:bg-retro-primary/90 transition-all duration-300 retro-border hover:scale-105"
          >
            Se connecter
          </Link>
          <Link
            href="/auth/signup"
            className="px-8 py-4 bg-retro-secondary text-retro-dark font-bold rounded-lg hover:bg-retro-secondary/90 transition-all duration-300 retro-border hover:scale-105"
          >
            S'inscrire
          </Link>
        </motion.div>

        <motion.div
          className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <FeatureCard
            title="🎯 Géolocalisation"
            description="Suivez votre progression en temps réel"
          />
          <FeatureCard
            title="🧩 Énigmes"
            description="Résolvez des défis pour avancer"
          />
          <FeatureCard
            title="👥 Multijoueur"
            description="Jouez seul ou en équipe"
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

function FeatureCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div
      className="glass-effect p-6 rounded-lg"
      whileHover={{ scale: 1.05, y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-retro-light/80">{description}</p>
    </motion.div>
  )
}
