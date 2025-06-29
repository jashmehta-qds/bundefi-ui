import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { LucideIcon, Pause, Play, Settings, Trash2 } from "lucide-react"

interface StrategyListItemProps {
  id: string
  name: string
  type: 'timed' | 'trigger' | 'ai'
  status: 'active' | 'paused' | 'draft'
  icon: LucideIcon
  color: string
  onEdit: (id: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export function StrategyListItem({
  id,
  name,
  type,
  status,
  icon: Icon,
  color,
  onEdit,
  onToggle,
  onDelete
}: StrategyListItemProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="font-medium">{name}</h3>
          <p className="text-sm text-muted-foreground capitalize">
            {type} strategy
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge 
          variant={status === 'active' ? 'default' : 'secondary'}
        >
          {status}
        </Badge>
        <Button size="sm" variant="outline" onClick={() => onEdit(id)}>
          <Settings className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="outline" onClick={() => onToggle(id)}>
          {status === 'active' ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button size="sm" variant="outline" onClick={() => onDelete(id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 