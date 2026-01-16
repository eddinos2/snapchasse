'use client'

import { HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular'
  lines?: number
}

export function Skeleton({ variant = 'rectangular', lines = 1, className, ...props }: SkeletonProps) {
  const baseStyles = 'animate-pulse bg-gray-200 rounded'

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              baseStyles,
              i === lines - 1 ? 'w-3/4' : 'w-full',
              'h-4',
              className
            )}
          />
        ))}
      </div>
    )
  }

  const variantStyles = {
    text: 'h-4 w-full',
    circular: 'rounded-full aspect-square',
    rectangular: 'w-full h-full',
  }

  return <div className={clsx(baseStyles, variantStyles[variant], className)} {...props} />
}
