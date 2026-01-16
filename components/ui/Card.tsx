'use client'

import { HTMLAttributes, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { clsx } from 'clsx'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'glass' | 'elevated'
  hover?: boolean
  interactive?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', hover = false, interactive = false, className, children, ...props }, ref) => {
    const variants = {
      default: 'card p-6',
      glass: 'glass rounded-2xl p-6 border border-gray-200/50',
      elevated: 'bg-white rounded-2xl p-6 shadow-large',
    }
    
    const hoverStyles = hover || interactive ? 'cursor-pointer' : ''
    
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={hover || interactive ? { y: -4, scale: 1.01 } : undefined}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={clsx(variants[variant], hoverStyles, className)}
        {...(props as any)}
      >
        {children}
      </motion.div>
    )
  }
)

Card.displayName = 'Card'
