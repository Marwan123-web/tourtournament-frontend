'use client';  // ✅ REQUIRED for useAuth!

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Users, Calendar, BarChart3 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

export default function Home() {
  const { user } = useAuth()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-20 bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-6xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6">
            Tournament Manager
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Create tournaments, manage teams, schedule matches, track live standings. 
            Complete tournament system for football, basketball, volleyball.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/tournaments">
              <Button size="lg" className="text-lg px-8">
                <Trophy className="mr-2 h-5 w-5" />
                Browse Tournaments
              </Button>
            </Link>
            {user && (
              <Link href="/tournaments/new">
                <Button size="lg" variant="outline" className="text-lg px-8">
                  <Calendar className="mr-2 h-5 w-5" />
                  Create Tournament
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500/5">
          <CardHeader>
            <Trophy className="h-12 w-12 text-blue-600 mx-auto mb-4" />
            <CardTitle>Create Tournaments</CardTitle>
            <CardDescription>Set dates, sports, team limits</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-500/5">
          <CardHeader>
            <Users className="h-12 w-12 text-green-600 mx-auto mb-4" />
            <CardTitle>Manage Teams</CardTitle>
            <CardDescription>Register teams + players</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-500/5">
          <CardHeader>
            <Calendar className="h-12 w-12 text-orange-600 mx-auto mb-4" />
            <CardTitle>Schedule Matches</CardTitle>
            <CardDescription>Live scoring + results</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500/5">
          <CardHeader>
            <BarChart3 className="h-12 w-12 text-purple-600 mx-auto mb-4" />
            <CardTitle>Live Standings</CardTitle>
            <CardDescription>Real-time rankings + stats</CardDescription>
          </CardHeader>
        </Card>
      </section>

      {/* CTA */}
      <section className="text-center py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl">
        <h2 className="text-4xl font-bold mb-4">Ready to start?</h2>
        <p className="text-xl mb-8 opacity-90 max-w-md mx-auto">
          Create your first tournament in 30 seconds
        </p>
        <Link href={user ? '/tournaments/new' : '/auth/signup'}>
          <Button size="lg" className="text-lg px-12 bg-white text-indigo-600 hover:bg-white/90">
            Get Started Free
          </Button>
        </Link>
      </section>
    </div>
  )
}
