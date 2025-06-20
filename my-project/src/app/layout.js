import './globals.css'
import Header from '@/components/Header'
import Navigation from '@/components/Navigation'

export const metadata = {
  title: 'AI Knowledge Base',
  description: 'Social Garden AI Knowledge Base',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-foreground">
        <Header />
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
