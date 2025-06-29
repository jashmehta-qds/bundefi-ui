import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Strategy, StrategyType } from "@/types/automation"
import { StrategyListItem } from "./strategy-list-item"

interface StrategiesListProps {
  strategies: Strategy[]
  strategyTypes: StrategyType[]
  onEdit: (id: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function StrategiesList({
  strategies,
  strategyTypes,
  onEdit,
  onToggle,
  onDelete
}: StrategiesListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Strategies</CardTitle>
        <CardDescription>
          Manage your existing automation strategies
        </CardDescription>
      </CardHeader>
      <CardContent>
        {strategies.length > 0 ? (
          <div className="space-y-4">
            {strategies.map((strategy) => {
              const config = strategyTypes.find(s => s.type === strategy.type)
              if (!config) return null
              
              return (
                <StrategyListItem
                  key={strategy.id}
                  id={strategy.id}
                  name={strategy.name}
                  type={strategy.type}
                  status={strategy.status}
                  icon={config.icon}
                  color={config.color}
                  onEdit={onEdit}
                  onToggle={onToggle}
                  onDelete={onDelete}
                />
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              No strategies created yet. Start by creating your first automation strategy above.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 