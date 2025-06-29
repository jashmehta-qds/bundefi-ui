import { Button } from "@/components/ui/button"
import { FlowNode } from "@/types/automation"
import { Settings, Zap } from "lucide-react"
import { useCallback, useMemo, useRef, useState } from "react"
import { NodeEditDialog } from "./node-edit-dialog"

interface FlowCanvasProps {
  nodes: FlowNode[]
  connections: Array<{ from: string; to: string }>
  onAddCondition: (x: number, y: number) => void
  onAddAction: (x: number, y: number) => void
  onNodeUpdate: (node: FlowNode) => void
  onNodeDelete: (nodeId: string) => void
  onNodeMove: (nodeId: string, x: number, y: number) => void
}

interface DragState {
  isDragging: boolean
  nodeId: string | null
  offset: { x: number; y: number }
  startTime: number
  hasMoved: boolean
}

interface ContextMenu {
  x: number
  y: number
  show: boolean
}

export function FlowCanvas({ 
  nodes, 
  connections,
  onAddCondition, 
  onAddAction, 
  onNodeUpdate,
  onNodeDelete,
  onNodeMove
}: FlowCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    nodeId: null,
    offset: { x: 0, y: 0 },
    startTime: 0,
    hasMoved: false
  })
  const [showContextMenu, setShowContextMenu] = useState<ContextMenu>({
    x: 0,
    y: 0,
    show: false
  })
  const [editingNode, setEditingNode] = useState<FlowNode | null>(null)

  // Filter out any invalid nodes and memoize
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => node && node.id && typeof node.x === 'number' && typeof node.y === 'number')
  }, [nodes])

  // Generate automatic sequential connections
  const autoConnections = useMemo(() => {
    const sequentialConnections: Array<{ from: string; to: string }> = []
    
    // Separate start node from other nodes
    const startNode = filteredNodes.find(node => node.type === 'start')
    const otherNodes = filteredNodes.filter(node => node.type !== 'start')
    
    // Sort other nodes by creation order (timestamp in ID)
    const sortedOtherNodes = otherNodes.sort((a, b) => {
      // Extract timestamp from ID (assuming format like "condition-1234567890" or "action-1234567890")
      const aTime = parseInt(a.id.split('-')[1] || '0')
      const bTime = parseInt(b.id.split('-')[1] || '0')
      return aTime - bTime
    })
    
    // Create the final ordered list: start first, then others in creation order
    const orderedNodes = startNode ? [startNode, ...sortedOtherNodes] : sortedOtherNodes
    
    // Create sequential connections
    for (let i = 0; i < orderedNodes.length - 1; i++) {
      sequentialConnections.push({
        from: orderedNodes[i].id,
        to: orderedNodes[i + 1].id
      })
    }
    

    
    return sequentialConnections
  }, [filteredNodes])

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Don't show context menu if we just finished dragging
    if (dragState.hasMoved) {
      return
    }

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setShowContextMenu({
      x,
      y,
      show: true
    })
  }, [dragState.hasMoved])

  const handleContextMenuAction = useCallback((action: 'condition' | 'action', x: number, y: number) => {
    if (action === 'condition') {
      onAddCondition(x, y)
    } else {
      onAddAction(x, y)
    }
    setShowContextMenu({ x: 0, y: 0, show: false })
  }, [onAddCondition, onAddAction])

  const handleNodeClick = useCallback((node: FlowNode, e: React.MouseEvent) => {
    e.stopPropagation()
    // Only open edit dialog if we haven't moved (not a drag)
    if (!dragState.hasMoved && node.type !== 'start') {
      setEditingNode(node)
    }
  }, [dragState.hasMoved])

  const handleMouseDown = useCallback((node: FlowNode, e: React.MouseEvent) => {
    if (node.type === 'start') return // Start node can't be moved
    
    e.preventDefault()
    e.stopPropagation()
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const offsetX = e.clientX - rect.left - node.x
    const offsetY = e.clientY - rect.top - node.y
    
    setDragState({
      isDragging: true,
      nodeId: node.id,
      offset: { x: offsetX, y: offsetY },
      startTime: Date.now(),
      hasMoved: false
    })
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.nodeId) return
    
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const x = Math.max(0, Math.min(rect.width - 120, e.clientX - rect.left - dragState.offset.x))
    const y = Math.max(0, Math.min(rect.height - 40, e.clientY - rect.top - dragState.offset.y))
    
    // Mark as moved if we've dragged more than 5 pixels
    const currentNode = filteredNodes.find(n => n.id === dragState.nodeId)
    if (currentNode) {
      const distance = Math.sqrt(Math.pow(x - currentNode.x, 2) + Math.pow(y - currentNode.y, 2))
      if (distance > 5) {
        setDragState(prev => ({ ...prev, hasMoved: true }))
      }
    }
    
    // Use requestAnimationFrame for smooth dragging
    requestAnimationFrame(() => {
      onNodeMove(dragState.nodeId!, x, y)
    })
  }, [dragState.isDragging, dragState.nodeId, dragState.offset.x, dragState.offset.y, onNodeMove, filteredNodes])

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging) {
      // Reset drag state after a short delay to prevent immediate clicks
      setTimeout(() => {
        setDragState({
          isDragging: false,
          nodeId: null,
          offset: { x: 0, y: 0 },
          startTime: 0,
          hasMoved: false
        })
      }, 100)
    }
  }, [dragState.isDragging])

  // Hide context menu when clicking elsewhere
  const handleDocumentClick = useCallback(() => {
    setShowContextMenu(prev => ({ ...prev, show: false }))
  }, [])

  // Create SVG arrows between connected nodes with dashed lines
  const renderArrows = useMemo(() => {
    return autoConnections.map((connection, index) => {
      const fromNode = filteredNodes.find(n => n.id === connection.from)
      const toNode = filteredNodes.find(n => n.id === connection.to)
      
      if (!fromNode || !toNode) {
        return null
      }
      
      const fromX = fromNode.x + 60 // Center of node (assuming 120px width)
      const fromY = fromNode.y + 20 // Center of node (assuming 40px height)
      const toX = toNode.x + 60
      const toY = toNode.y + 20
      
      // Calculate control points for smooth curve
      const deltaX = toX - fromX
      const deltaY = toY - fromY
      const controlX1 = fromX + deltaX * 0.3
      const controlY1 = fromY
      const controlX2 = toX - deltaX * 0.3
      const controlY2 = toY
      
      return (
        <g key={`${connection.from}-${connection.to}-${index}`}>
          {/* Dashed arrow line */}
          <path
            d={`M ${fromX} ${fromY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toX} ${toY}`}
            stroke="#6366f1"
            strokeWidth="3"
            strokeDasharray="8 4"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="transition-all duration-200"
            style={{ opacity: 1 }}
          />
        </g>
      )
    })
  }, [autoConnections, filteredNodes])

  return (
    <div className="relative" onClick={handleDocumentClick}>
      {/* Header Controls */}
      <div className="flex gap-2 mb-4 p-3 bg-muted/50 rounded-lg border">
        <Button
          variant="outline"
          size="sm"
          className="border-dashed"
          onClick={() => onAddCondition(150, 100)}
        >
          <Settings className="mr-2 h-4 w-4" />
          Add Condition
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-dashed"
          onClick={() => onAddAction(300, 100)}
        >
          <Zap className="mr-2 h-4 w-4" />
          Add Action
        </Button>
        <div className="ml-auto text-sm text-muted-foreground flex items-center">
          Click anywhere on canvas to add nodes • Drag nodes to move • Click nodes to edit
        </div>
      </div>

      {/* Canvas */}
      <div 
        ref={canvasRef}
        className="relative h-[650px] w-full overflow-hidden rounded-lg border bg-background cursor-crosshair select-none"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Dotted Canvas Background */}
        <div 
          className="canvas-background absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #94a3b8 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />
        
        {/* SVG for arrows - ensure it covers the full canvas */}
        <svg 
          className="absolute inset-0 pointer-events-none w-full h-full" 
          style={{ zIndex: 1 }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
              markerUnits="strokeWidth"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6366f1"
              />
            </marker>
          </defs>
          {renderArrows}
        </svg>
        
        {/* Flow Nodes */}
        <div className="relative h-full w-full" style={{ zIndex: 2 }}>
          {filteredNodes.map((node) => (
            <div
              key={node.id}
              className={`absolute flex items-center justify-center rounded-lg border-2 px-4 py-2 text-sm font-medium shadow-sm transition-all select-none ${
                node.type === 'start' 
                  ? 'border-green-500 bg-green-50 text-green-700 cursor-default' 
                  : node.type === 'condition'
                  ? 'border-orange-500 bg-orange-50 text-orange-700 cursor-move hover:border-orange-600 hover:shadow-md'
                  : 'border-blue-500 bg-blue-50 text-blue-700 cursor-move hover:border-blue-600 hover:shadow-md'
              } ${dragState.nodeId === node.id && dragState.isDragging ? 'shadow-lg scale-105 z-50' : ''}`}
              style={{ 
                left: node.x, 
                top: node.y,
                minWidth: '120px',
                height: '40px',
                transform: dragState.nodeId === node.id && dragState.isDragging ? 'rotate(2deg)' : 'none'
              }}
              onClick={(e) => handleNodeClick(node, e)}
              onMouseDown={(e) => handleMouseDown(node, e)}
            >
              <div className="flex items-center gap-2 pointer-events-none">
                {node.type === 'condition' && <Settings className="h-4 w-4" />}
                {node.type === 'action' && <Zap className="h-4 w-4" />}
               
                <span className="truncate">{node.label}</span>
              </div>
            </div>
          ))}
          
          {/* Context Menu */}
          {showContextMenu.show && (
            <div
              className="absolute bg-background border rounded-lg shadow-lg p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
              style={{ left: showContextMenu.x, top: showContextMenu.y }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleContextMenuAction('condition', showContextMenu.x, showContextMenu.y)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Add Condition
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="justify-start"
                  onClick={() => handleContextMenuAction('action', showContextMenu.x, showContextMenu.y)}
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Add Action
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node Edit Dialog */}
      {editingNode && (
        <NodeEditDialog
          node={editingNode}
          onSave={onNodeUpdate}
          onDelete={onNodeDelete}
          onClose={() => setEditingNode(null)}
        />
      )}
    </div>
  )
} 