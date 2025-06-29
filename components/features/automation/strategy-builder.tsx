import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FlowNode, Strategy } from "@/types/automation"
import { FlowCanvas } from "./flow-canvas"
import { StrategyConfig } from "./strategy-config"

interface StrategyBuilderProps {
  strategy: Strategy
  strategyType: {
    title: string
    icon: any
  }
  onStrategyChange: (strategy: Strategy) => void
  onSave: () => void
  onCancel: () => void
}

export function StrategyBuilder({
  strategy,
  strategyType,
  onStrategyChange,
  onSave,
  onCancel
}: StrategyBuilderProps) {
  const handleAddCondition = (x: number, y: number) => {
    const newNode = {
      id: `condition-${Date.now()}`,
      type: 'condition' as const,
      label: 'New Condition',
      x: x - 60, // Center the node on click position
      y: y - 20,
      config: {}
    }
    
    // Just add the node - connections are automatic
    onStrategyChange({
      ...strategy,
      nodes: [...strategy.nodes, newNode]
    })
  }

  const handleAddAction = (x: number, y: number) => {
    const newNode = {
      id: `action-${Date.now()}`,
      type: 'action' as const,
      label: 'New Action',
      x: x - 50, // Center the node on click position
      y: y - 20,
      config: {}
    }
    
    // Just add the node - connections are automatic
    onStrategyChange({
      ...strategy,
      nodes: [...strategy.nodes, newNode]
    })
  }

  const handleNodeUpdate = (updatedNode: FlowNode) => {
    onStrategyChange({
      ...strategy,
      nodes: strategy.nodes.map(node => 
        node.id === updatedNode.id ? updatedNode : node
      )
    })
  }

  const handleNodeDelete = (nodeId: string) => {
    // Remove the node - connections will be automatically recalculated
    onStrategyChange({
      ...strategy,
      nodes: strategy.nodes.filter(node => node.id !== nodeId)
    })
  }

  const handleNodeMove = (nodeId: string, x: number, y: number) => {
    onStrategyChange({
      ...strategy,
      nodes: strategy.nodes.map(node =>
        node.id === nodeId ? { ...node, x, y } : node
      )
    })
  }

  return (
    <>
      <div className="mb-6">
        <Button variant="outline" onClick={onCancel}>
          ← Back to Strategies
        </Button>
      </div>

      <Card>

        <CardContent className="p-0">
          {/* Split Layout: Config Sidebar + Canvas */}
          <div className="flex h-[700px]">
            {/* Left Sidebar - Strategy Configuration */}
            <div className="w-80 border-r bg-muted/30 p-4 overflow-y-auto">
              <StrategyConfig
                strategy={strategy}
                strategyType={strategyType}
                onStrategyChange={onStrategyChange}
                onSave={onSave}
                onCancel={onCancel}
                isCompact={true}
              />
            </div>
            
            {/* Right Side - Flow Canvas */}
            <div className="flex-1 p-4">
              <FlowCanvas
                nodes={strategy.nodes}
                connections={strategy.connections}
                onAddCondition={handleAddCondition}
                onAddAction={handleAddAction}
                onNodeUpdate={handleNodeUpdate}
                onNodeDelete={handleNodeDelete}
                onNodeMove={handleNodeMove}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
} 