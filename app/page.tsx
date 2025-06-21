import Link from "next/link"
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { scenarios } from "@/lib/game-config"
import { ArrowRight } from "lucide-react"

export default function ScenarioSelectionPage() {
  return (
    <div className="container mx-auto p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
      <header className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-brand-primary mb-4">哄老板模拟器</h1>
        <p className="text-lg text-gray-600">挑战开始！看看你的职场情商有多高，能否在10回合内让老板满意？</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 w-full max-w-4xl">
        {scenarios.map((scenario) => (
          <Card key={scenario.id} className="hover:shadow-xl transition-shadow duration-300 bg-white">
            <CardHeader>
              <CardTitle className="text-2xl text-brand-text">{scenario.title}</CardTitle>
              <CardDescription className="text-gray-500 pt-2 min-h-[40px]">{scenario.description}</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild className="w-full bg-brand-primary hover:bg-brand-secondary text-white">
                <Link href={`/play/${scenario.slug}`}>
                  开始挑战 <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      <footer className="mt-12 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} 哄老板模拟器. 纯属娱乐, 如有雷同, 概不负责.</p>
      </footer>
    </div>
  )
}
