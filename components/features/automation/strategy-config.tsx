import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Strategy } from "@/types/automation"
import { LucideIcon } from "lucide-react"

interface StrategyConfigProps {
  strategy: Strategy
  strategyType: {
    title: string
    icon: LucideIcon
  }
  onStrategyChange: (strategy: Strategy) => void
  onSave: () => void
  onCancel: () => void
  isCompact?: boolean
}

export function StrategyConfig({
  strategy,
  strategyType,
  onStrategyChange,
  onSave,
  onCancel,
  isCompact = false
}: StrategyConfigProps) {
  const updateStrategy = (updates: Partial<Strategy>) => {
    onStrategyChange({ ...strategy, ...updates })
  }

  const renderTypeSpecificConfig = () => {
    switch (strategy.type) {
      case 'timed':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Execution Frequency</Label>
              <Select defaultValue="daily">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Every Hour</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Execution Time</Label>
              <Input type="time" defaultValue="09:00" />
            </div>
          </div>
        )

      case 'trigger':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Trigger Condition</Label>
              <Select defaultValue="price">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price">Price Movement</SelectItem>
                  <SelectItem value="volatility">Volatility Threshold</SelectItem>
                  <SelectItem value="volume">Volume Spike</SelectItem>
                  <SelectItem value="apy">APY Change</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Threshold (%)</Label>
              <Slider
                defaultValue={[5]}
                max={50}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
          </div>
        )

      case 'ai':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <Select defaultValue="conservative">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="sentiment-analysis" />
              <Label htmlFor="sentiment-analysis">Enable Sentiment Analysis</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="risk-management" defaultChecked />
              <Label htmlFor="risk-management">Automatic Risk Management</Label>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (isCompact) {
    return (
      <div className="space-y-6">
        {/* Compact Header */}
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
            <strategyType.icon className="h-5 w-5" />
            Configuration
          </h3>
          <p className="text-sm text-muted-foreground">
            Set up your {strategy.type} strategy
          </p>
        </div>

        {/* Strategy Name */}
        <div className="space-y-2">
          <Label htmlFor="strategy-name">Strategy Name</Label>
          <Input
            id="strategy-name"
            placeholder="Enter strategy name"
            value={strategy.name}
            onChange={(e) => updateStrategy({ name: e.target.value })}
          />
        </div>

        {/* Strategy Status */}
        <div className="space-y-2">
          <Label htmlFor="strategy-status">Status</Label>
          <Select 
            value={strategy.status} 
            onValueChange={(value: 'active' | 'paused' | 'draft') => 
              updateStrategy({ status: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="paused">Paused</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Type-specific configuration */}
        {renderTypeSpecificConfig()}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4">
          <Button onClick={onSave} className="w-full">
            Save Strategy
          </Button>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <strategyType.icon className="h-5 w-5" />
          Configure {strategyType.title}
        </CardTitle>
        <CardDescription>
          Set up parameters for your {strategy.type} strategy
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="strategy-name">Strategy Name</Label>
            <Input
              id="strategy-name"
              placeholder="Enter strategy name"
              value={strategy.name}
              onChange={(e) => updateStrategy({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="strategy-status">Status</Label>
            <Select 
              value={strategy.status} 
              onValueChange={(value: 'active' | 'paused' | 'draft') => 
                updateStrategy({ status: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {renderTypeSpecificConfig()}

        <div className="flex gap-2 pt-4">
          <Button onClick={onSave}>
            Save Strategy
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 