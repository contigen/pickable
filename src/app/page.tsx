import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  TrendingUp,
  CheckCircle,
  MessageSquare,
  AlertTriangle,
} from 'lucide-react'

export default function Home() {
  return (
    <div className='flex flex-col gap-16 pb-16'>
      <section className='w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-background via-primary/5 to-primary/10 relative overflow-hidden'>
        <div className='container px-4 md:px-6 relative'>
          <div className='flex flex-col items-center gap-6 text-center'>
            <Badge
              className='px-4 py-2 bg-primary/10 text-primary border-primary/20'
              variant='outline'
            >
              AI-Powered Business Forecasting
            </Badge>
            <h1 className='text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-balance'>
              Ask Your Business Data
              <span className='bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent block pb-1'>
                Anything
              </span>
            </h1>
            <p className='max-w-[700px] text-muted-foreground md:text-xl leading-relaxed text-pretty'>
              Connect your data sources and chat with your business
              intelligence. Get instant forecasts, inventory alerts, and
              actionable recommendations in plain English.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 mt-6'>
              <Button className='text-lg shadow-lg hover:shadow-xl transition-all'>
                <Link href='/onboarding' className='inline-flex items-center'>
                  Connect Your Data
                  <ArrowRight className='ml-2 size-5' />
                </Link>
              </Button>
              <Button variant='outline' className='text-lg bg-transparent'>
                <Link href='/dashboard'>Go to Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className='container px-4 md:px-6'>
        <div className='flex flex-col items-center gap-4 text-center mb-12'>
          <h2 className='text-3xl font-bold tracking-tight sm:text-4xl text-balance'>
            Why Choose Our AI Forecasting?
          </h2>
          <p className='max-w-[700px] text-muted-foreground text-lg text-pretty'>
            Transform your business data into actionable insights with natural
            language queries and AI-powered predictions.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
          <Card className='relative overflow-hidden group hover:shadow-lg transition-all duration-300'>
            <CardContent className='pt-8 pb-6'>
              <div className='flex flex-col items-center gap-4 text-center'>
                <div className='p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                  <MessageSquare className='size-8 text-primary' />
                </div>
                <h3 className='text-xl font-bold'>Natural Language Queries</h3>
                <p className='text-muted-foreground leading-relaxed text-pretty'>
                  Ask questions like &quot;Which products will run out next
                  month?&quot; and get instant, visual answers with supporting
                  data.
                </p>
                <div className='flex items-center gap-2 text-sm text-primary'>
                  <CheckCircle className='size-4' />
                  <span>Chat-style interface</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden group hover:shadow-lg transition-all duration-300'>
            <CardContent className='pt-8 pb-6'>
              <div className='flex flex-col items-center gap-4 text-center'>
                <div className='p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                  <AlertTriangle className='size-8 text-primary' />
                </div>
                <h3 className='text-xl font-bold'>Smart Inventory Alerts</h3>
                <p className='text-muted-foreground leading-relaxed text-pretty'>
                  Get proactive warnings about stockouts and overstock
                  situations with clear explanations and recommended actions.
                </p>
                <div className='flex items-center gap-2 text-sm text-primary'>
                  <CheckCircle className='size-4' />
                  <span>Traffic light indicators</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='relative overflow-hidden group hover:shadow-lg transition-all duration-300'>
            <CardContent className='pt-8 pb-6'>
              <div className='flex flex-col items-center gap-4 text-center'>
                <div className='p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors'>
                  <TrendingUp className='size-8 text-primary' />
                </div>
                <h3 className='text-xl font-bold'>
                  Actionable Recommendations
                </h3>
                <p className='text-muted-foreground leading-relaxed text-pretty'>
                  Receive specific, date-driven advice like &quot;Order 25 units
                  of Product X before Sept 14&quot; with full reasoning.
                </p>
                <div className='flex items-center gap-2 text-sm text-primary'>
                  <CheckCircle className='size-4' />
                  <span>Plain English explanations</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className='container px-4 md:px-6 bg-muted/30 py-16 rounded-3xl'>
        <div className='flex flex-col items-center gap-4 text-center mb-12'>
          <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl text-balance'>
            How It Works
          </h2>
          <p className='max-w-[700px] text-muted-foreground text-lg text-pretty'>
            Get AI-powered business insights in three simple steps.
          </p>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-8 relative'>
          <div className='flex flex-col items-center text-center relative'>
            <div className='w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-lg'>
              1
            </div>
            <h3 className='text-xl font-bold mb-2'>Connect Data Sources</h3>
            <p className='text-muted-foreground text-pretty'>
              Upload CSV files.
            </p>
          </div>

          <div className='hidden md:flex items-center justify-center'>
            <ArrowRight className='size-8 text-primary/60' />
          </div>

          <div className='flex flex-col items-center text-center relative'>
            <div className='w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-lg'>
              2
            </div>
            <h3 className='text-xl font-bold mb-2'>Ask Natural Questions</h3>
            <p className='text-muted-foreground text-pretty'>
              Use our AI query bar to ask questions in plain English. Get
              instant answers with charts and explanations.
            </p>
          </div>

          <div className='hidden md:flex items-center justify-center'>
            <ArrowRight className='size-8 text-primary/60' />
          </div>

          <div className='flex flex-col items-center text-center relative'>
            <div className='w-16 h-16 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold mb-4 shadow-lg'>
              3
            </div>
            <h3 className='text-xl font-bold mb-2'>
              Get Smart Recommendations
            </h3>
            <p className='text-muted-foreground text-pretty'>
              Receive actionable advice cards with specific dates, quantities,
              and reasoning to guide your decisions.
            </p>
          </div>
        </div>
      </section>

      <section className='container px-4 md:px-6'>
        <Card className='bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 overflow-hidden relative'>
          <CardContent className='pt-12 pb-12 text-center relative'>
            <div className='max-w-2xl mx-auto'>
              <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl mb-4 text-balance'>
                Ready to Chat with Your Business Data?
              </h2>
              <p className='text-muted-foreground text-lg mb-8 text-pretty'>
                Join small businesses already using AI to make smarter inventory
                and sales decisions.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
