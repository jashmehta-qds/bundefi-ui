import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { StrategyType } from "@/types/automation"
import { Plus } from "lucide-react"

interface StrategyTypeCardProps extends StrategyType {
  onSelect: (type: 'timed' | 'trigger' | 'ai') => void
}

export function StrategyTypeCard({
  type,
  title,
  description,
  icon: Icon,
  color,
  examples,
  onSelect
}: StrategyTypeCardProps) {
  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] relative overflow-hidden border-2 hover:border-primary/20"
      onClick={() => onSelect(type)}
    >
      {/* Hover Overlay */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      
      {/* Floating Action Indicator */}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <div className={`p-2 rounded-full ${color} shadow-lg`}>
          <Plus className="h-4 w-4 text-white" />
        </div>
      </div>

      <CardHeader className="relative z-10">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${color} transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">{title}</CardTitle>
            <CardDescription className="group-hover:text-foreground/80 transition-colors duration-300">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {examples.map((example, index) => (
              <Badge 
                key={index} 
                className={`text-xs ${color} opacity-65 group-hover:opacity-80 transition-opacity duration-300`}
              >
                {example}
              </Badge>
            ))}
          </div>
        </div>
        
        {/* Subtle Call-to-Action Text */}
        
      </CardContent>
    </Card>
  )
} 