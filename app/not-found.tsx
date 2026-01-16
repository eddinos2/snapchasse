import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full p-8 text-center bg-white rounded-2xl shadow-large">
        <h1 className="text-6xl font-bold text-primary-500 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Page introuvable
        </h2>
        <p className="text-gray-600 mb-6">
          La page que vous recherchez n&apos;existe pas ou a été déplacée.
        </p>
        <Link 
          href="/"
          className="inline-block px-8 py-4 text-lg font-semibold rounded-xl btn-primary text-white transition-all duration-300 hover:scale-105"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  )
}
