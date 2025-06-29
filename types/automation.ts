import { LucideIcon } from "lucide-react"

export interface FlowNode {
  id: string
  type: 'start' | 'condition' | 'action' | 'end'
  label: string
  x: number
  y: number
  config?: any
}

export interface Strategy {
  id: string
  name: string
  type: 'timed' | 'trigger' | 'ai'
  status: 'active' | 'paused' | 'draft'
  nodes: FlowNode[]
  connections: Array<{ from: string; to: string }>
}

export interface StrategyType {
  type: 'timed' | 'trigger' | 'ai'
  title: string
  description: string
  icon: LucideIcon
  color: string
  examples: string[]
} 