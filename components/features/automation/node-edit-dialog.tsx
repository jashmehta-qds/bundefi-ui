import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { FlowNode } from "@/types/automation"
import { Settings, Trash2, Zap } from "lucide-react"
import { useEffect, useState } from "react"

interface NodeEditDialogProps {
  node: FlowNode
  onClose: () => void
  onSave: (node: FlowNode) => void
  onDelete: (nodeId: string) => void
}

export function NodeEditDialog({
  node,
  onClose,
  onSave,
  onDelete
}: NodeEditDialogProps) {
  const [editedNode, setEditedNode] = useState<FlowNode | null>(node)

  // Update local state when node prop changes
  useEffect(() => {
    setEditedNode(node)
  }, [node])

  if (!editedNode) return null

  const handleSave = () => {
    onSave(editedNode)
    onClose()
  }

  const handleDelete = () => {
    onDelete(editedNode.id)
    onClose()
  }

  const updateNode = (updates: Partial<FlowNode>) => {
    setEditedNode({ ...editedNode, ...updates })
  }

  const updateConfig = (key: string, value: any) => {
    setEditedNode({
      ...editedNode,
      config: { ...editedNode.config, [key]: value }
    })
  }

  const renderConditionConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Condition Type</Label>
        <Select 
          value={editedNode.config?.type || 'price'} 
          onValueChange={(value) => updateConfig('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="price">Price Movement</SelectItem>
            <SelectItem value="volatility">Volatility Threshold</SelectItem>
            <SelectItem value="volume">Volume Spike</SelectItem>
            <SelectItem value="apy">APY Change</SelectItem>
            <SelectItem value="time">Time Based</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Threshold Value</Label>
        <Input
          type="number"
          placeholder="Enter threshold value"
          value={editedNode.config?.threshold || ''}
          onChange={(e) => updateConfig('threshold', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Comparison</Label>
        <Select 
          value={editedNode.config?.comparison || 'greater'} 
          onValueChange={(value) => updateConfig('comparison', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="greater">Greater than</SelectItem>
            <SelectItem value="less">Less than</SelectItem>
            <SelectItem value="equal">Equal to</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  const renderActionConfig = () => (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Action Type</Label>
        <Select 
          value={editedNode.config?.type || 'rebalance'} 
          onValueChange={(value) => updateConfig('type', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="rebalance">Rebalance Portfolio</SelectItem>
            <SelectItem value="withdraw">Withdraw Funds</SelectItem>
            <SelectItem value="deposit">Deposit Funds</SelectItem>
            <SelectItem value="swap">Swap Assets</SelectItem>
            <SelectItem value="notify">Send Notification</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <Label>Amount (%)</Label>
        <Input
          type="number"
          placeholder="Enter percentage"
          value={editedNode.config?.amount || ''}
          onChange={(e) => updateConfig('amount', e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label>Target Asset</Label>
        <Select 
          value={editedNode.config?.asset || 'USDC'} 
          onValueChange={(value) => updateConfig('asset', value)}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="USDC">USDC</SelectItem>
            <SelectItem value="ETH">ETH</SelectItem>
            <SelectItem value="WBTC">WBTC</SelectItem>
            <SelectItem value="DAI">DAI</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {editedNode.type === 'condition' ? (
              <Settings className="h-5 w-5" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
            Edit {editedNode.type === 'condition' ? 'Condition' : 'Action'}
          </DialogTitle>
          <DialogDescription>
            Configure the parameters for this {editedNode.type}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Label</Label>
            <Input
              placeholder="Enter node label"
              value={editedNode.label}
              onChange={(e) => updateNode({ label: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              placeholder="Enter description (optional)"
              value={editedNode.config?.description || ''}
              onChange={(e) => updateConfig('description', e.target.value)}
            />
          </div>

          {editedNode.type === 'condition' && renderConditionConfig()}
          {editedNode.type === 'action' && renderActionConfig()}
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            className="mr-auto"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
} 