import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Zap, Search, BarChart3, Briefcase, FileText, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const FeatureCard = ({ icon: Icon, title, children }: { icon: React.ElementType, title: string, children: React.ReactNode }) => (
    <Card className="bg-card/50 backdrop-blur-sm border-border/20 text-center shadow-lg hover:shadow-xl transition-shadow duration-300 h-full">
        <CardHeader className="items-center">
            <div className="p-4 bg-primary/10 rounded-full mb-4">
                <Icon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground">
            {children}
        </CardContent>
    </Card>
);

const StepCard = ({ icon: Icon, title, description, step }: { icon: React.ElementType, title: string, description: string, step: number }) => (
    <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
            <div className="p-5 bg-secondary rounded-full border-4 border-background">
                 <Icon className="h-8 w-8 text-secondary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm">
                {step}
            </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground px-4">{description}</p>
    </div>
);


const TestimonialCard = ({ quote, name, title, avatarSrc, avatarHint }: { quote: string, name: string, title: string, avatarSrc: string, avatarHint: string }) => (
    <Card className="bg-card/80 p-6 shadow-md h-full flex flex-col">
        <CardContent className="p-0 flex-grow flex flex-col">
            <p className="text-muted-foreground mb-6 italic flex-grow">"{quote}"</p>
            <div className="flex items-center gap-4 mt-auto">
                <Avatar>
                    <AvatarImage src={avatarSrc} alt={name} data-ai-hint={avatarHint} />
                    <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <p className="font-semibold">{name}</p>
                    <p className="text-sm text-muted-foreground">{title}</p>
                </div>
            </div>
        </CardContent>
    </Card>
);


export default function Home() {
  return (
    <div className="space-y-24 md:space-y-32">
      {/* Hero Section */}
      <section className="text-center pt-8 md:pt-16">
        <div className="max-w-5xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-foreground font-headline">
            Unlock Your Next Career Move
            </h1>
            <p className="mt-4 mb-12 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            JobScout is your AI-powered co-pilot for navigating the job market. Search millions of jobs, gain data-driven insights, and get hired faster.
            </p>
            <div className="flex justify-center gap-4">
                 <Button asChild size="lg" variant="outline">
                    <Link href="/signup">Get Started</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">A Smarter Way to Job Hunt</h2>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl mx-auto">Our platform is packed with features to give you a competitive edge.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard icon={Search} title="Comprehensive Search">
                Access thousands of job listings aggregated from top job boards around the world, all in one place.
            </FeatureCard>
            <FeatureCard icon={Zap} title="AI-Powered Insights">
                Go beyond the job description. Get AI-suggested salary ranges, company ratings, and potential perks.
            </FeatureCard>
            <FeatureCard icon={BarChart3} title="Market Analytics">
                Understand the job market with our interactive dashboard. Analyze trends by location, role, and more.
            </FeatureCard>
        </div>
      </section>

      {/* How It Works Section */}
        <section className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Get Started in 3 Simple Steps</h2>
                <p className="mt-3 text-lg text-muted-foreground">It's never been easier to find your dream job.</p>
            </div>
            <div className="relative">
                <div className="absolute top-8 left-0 w-full h-0.5 bg-border hidden md:block" aria-hidden="true"></div>
                 <div className="grid md:grid-cols-3 gap-16 relative">
                    <StepCard icon={Briefcase} title="Search for Jobs" description="Use our powerful search to find roles that match your skills and ambitions." step={1} />
                    <StepCard icon={FileText} title="Analyze with AI" description="Leverage AI insights on job details to prepare for interviews and negotiations." step={2} />
                    <StepCard icon={CheckCircle} title="Apply with Confidence" description="Use data-driven knowledge to apply for jobs you're truly a great fit for." step={3} />
                </div>
            </div>
        </section>


      {/* Testimonials Section */}
      <section className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold font-headline">Why Professionals Love JobScout</h2>
            <p className="mt-3 text-lg text-muted-foreground">Don't just take our word for it. Here's what our users say.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
            <TestimonialCard 
                quote="The AI insights are a game-changer. I was able to negotiate a 15% higher salary thanks to the data JobScout provided."
                name="Sarah L."
                title="Senior Software Engineer"
                avatarSrc="https://placehold.co/100x100.png"
                avatarHint="woman face"
            />
             <TestimonialCard 
                quote="As a recent graduate, the job market felt overwhelming. JobScout helped me understand what companies are looking for and find the perfect first role."
                name="Michael B."
                title="Product Designer"
                avatarSrc="https://placehold.co/100x100.png"
                avatarHint="man face"
            />
             <TestimonialCard 
                quote="I've used every job board out there. JobScout is the first one that feels like it's actually built to help the job seeker, not just list jobs."
                name="Emily R."
                title="DevOps Manager"
                avatarSrc="https://placehold.co/100x100.png"
                avatarHint="woman professional"
            />
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-accent/10 rounded-lg py-16 px-8 text-center max-w-5xl mx-auto border border-accent/20">
        <h2 className="text-3xl md:text-4xl font-bold font-headline text-primary">Ready to Find Your Dream Job?</h2>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
          Start your search now and take the next step in your career with confidence.
        </p>
        <div className="mt-8">
            <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/signup">Get Started for Free</Link>
            </Button>
        </div>
      </section>
    </div>
  );
}
