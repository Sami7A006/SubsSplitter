import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, DollarSign, MessageCircle, Shield } from "lucide-react";
import { SiNetflix, SiSpotify, SiAmazon } from "react-icons/si";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">ShareSub</span>
            </div>
            <a href="/api/login">
              <Button size="default" data-testid="button-login">
                Log In
              </Button>
            </a>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Split Subscription Costs
                <span className="block text-primary">Save Money Together</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Connect with others to share app subscriptions. Create or join rooms for
                Netflix, Spotify, Disney+, and more. No payment processing—just coordination.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <a href="/api/login">
                  <Button size="lg" className="gap-2" data-testid="button-get-started">
                    Get Started
                  </Button>
                </a>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-muted-foreground">
                <SiNetflix className="h-8 w-8" />
                <SiSpotify className="h-8 w-8" />
                <SiAmazon className="h-8 w-8" />
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6" />
                  <span className="text-sm">And more</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-muted/30 py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-center text-3xl font-bold">How It Works</h2>
            <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Create or Browse Rooms</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Start a new room for your subscription or browse existing rooms to join.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <DollarSign className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Set Your Terms</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Choose the app, number of seats, and price per seat. Simple and transparent.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">Chat & Coordinate</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Use real-time chat to coordinate details with room members.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="mt-4 font-semibold">No Payment Processing</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We just connect people. Handle payments however you prefer.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold">Ready to Start Saving?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join hundreds of users sharing subscription costs
            </p>
            <div className="mt-8">
              <a href="/api/login">
                <Button size="lg" data-testid="button-cta-signup">
                  Sign Up Now
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            ShareSub - Connect and save together
          </p>
        </div>
      </footer>
    </div>
  );
}
