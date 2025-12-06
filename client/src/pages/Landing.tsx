import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Wallet, ArrowRightLeft, Shield, BarChart3, Bell } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: Wallet,
      title: "Portfolio Tracking",
      description: "Monitor your crypto holdings in real-time with detailed portfolio analytics"
    },
    {
      icon: TrendingUp,
      title: "Live Market Data",
      description: "Access real-time cryptocurrency prices and market trends"
    },
    {
      icon: ArrowRightLeft,
      title: "Easy Trading",
      description: "Buy, sell, and convert cryptocurrencies with just a few clicks"
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your data is protected with industry-standard security measures"
    },
    {
      icon: BarChart3,
      title: "Price Charts",
      description: "Visualize price movements with interactive charts"
    },
    {
      icon: Bell,
      title: "Price Alerts",
      description: "Set alerts to get notified when prices hit your targets"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/10" />
        
        <header className="relative border-b">
          <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">CryptoVault</span>
            </div>
            <Button asChild data-testid="button-login-header">
              <a href="/api/login">Sign In</a>
            </Button>
          </div>
        </header>

        <main className="relative">
          <section className="container mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Your Gateway to
                <span className="block text-primary">Cryptocurrency Trading</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground">
                Track your portfolio, execute trades, and stay on top of the crypto market 
                with our intuitive trading simulation platform.
              </p>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                <Button size="lg" asChild data-testid="button-get-started">
                  <a href="/api/login">Get Started</a>
                </Button>
                <Button size="lg" variant="outline" asChild data-testid="button-learn-more">
                  <a href="#features">Learn More</a>
                </Button>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                Start with $10,000 in virtual funds to practice trading
              </p>
            </div>
          </section>

          <section id="features" className="container mx-auto px-4 py-16">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight">
                Everything You Need to Trade
              </h2>
              <p className="mt-4 text-muted-foreground">
                Our platform provides all the tools you need to learn and practice cryptocurrency trading.
              </p>
            </div>
            
            <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="relative overflow-visible" data-testid={`card-feature-${index}`}>
                  <CardHeader>
                    <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                      <feature.icon className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-sm">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          <section className="container mx-auto px-4 py-16">
            <Card className="relative overflow-visible">
              <CardContent className="flex flex-col items-center p-8 text-center md:p-12">
                <h2 className="text-2xl font-bold md:text-3xl">
                  Ready to Start Trading?
                </h2>
                <p className="mt-4 max-w-xl text-muted-foreground">
                  Join CryptoVault today and begin your cryptocurrency trading journey 
                  with $10,000 in virtual funds.
                </p>
                <Button size="lg" className="mt-8" asChild data-testid="button-cta-signup">
                  <a href="/api/login">Create Your Account</a>
                </Button>
              </CardContent>
            </Card>
          </section>
        </main>

        <footer className="relative border-t">
          <div className="container mx-auto flex h-16 items-center justify-center px-4">
            <p className="text-sm text-muted-foreground">
              CryptoVault - Cryptocurrency Trading Simulation Platform
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
