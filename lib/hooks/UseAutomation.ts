import { Strategy, StrategyType } from "@/types/automation"
import { Brain, Clock, Zap } from "lucide-react"
import { useState } from "react"

export function useAutomation() {
  const [strategies, setStrategies] = useState<Strategy[]>([
    {
      id: '1',
      name: 'Daily Rebalance',
      type: 'timed',
      status: 'active',
      nodes: [],
      connections: []
    },
    {
      id: '2',
      name: 'Market Crash Protection',
      type: 'trigger',
      status: 'active',
      nodes: [],
      connections: []
    }
  ])

  const [selectedStrategy, setSelectedStrategy] = useState<'timed' | 'trigger' | 'ai' | null>(null)
  const [isBuilding, setIsBuilding] = useState(false)
  const [currentStrategy, setCurrentStrategy] = useState<Strategy | null>(null)

  const strategyTypes: StrategyType[] = [
    {
      type: 'timed',
      title: 'Timed Strategy',
      description: 'Execute actions based on time intervals',
      icon: Clock,
      color: 'bg-blue-500',
      examples: ['Daily rebalancing', 'Weekly Redeeming']
    },
    {
      type: 'trigger',
      title: 'Trigger Strategy',
      description: 'Execute actions based on market conditions',
      icon: Zap,
      color: 'bg-orange-500',
      examples: ['Price Alerts', 'Volatility Protection']
    },
    {
      type: 'ai',
      title: 'AI Strategy',
      description: 'AI-powered automated decision making',
      icon: Brain,
      color: 'bg-primary-500',
      examples: ['Sentiment Analysis', 'Risk Management']
    }
  ]

  const startBuilding = (type: 'timed' | 'trigger' | 'ai') => {
    setSelectedStrategy(type)
    setIsBuilding(true)
    setCurrentStrategy({
      id: Date.now().toString(),
      name: `New ${type} Strategy`,
      type,
      status: 'draft',
      nodes: [
        { id: 'start', type: 'start', label: 'Start', x: 100, y: 200 }
      ],
      connections: []
    })
  }

  const saveStrategy = () => {
    if (currentStrategy) {
      setStrategies(prev => [...prev, currentStrategy])
      setIsBuilding(false)
      setSelectedStrategy(null)
      setCurrentStrategy(null)
    }
  }

  const cancelBuilding = () => {
    setIsBuilding(false)
    setSelectedStrategy(null)
    setCurrentStrategy(null)
  }

  const editStrategy = (id: string) => {
    const strategy = strategies.find(s => s.id === id)
    if (strategy) {
      setCurrentStrategy(strategy)
      setSelectedStrategy(strategy.type)
      setIsBuilding(true)
    }
  }

  const toggleStrategy = (id: string) => {
    setStrategies(prev => prev.map(strategy => 
      strategy.id === id 
        ? { ...strategy, status: strategy.status === 'active' ? 'paused' : 'active' as const }
        : strategy
    ))
  }

  const deleteStrategy = (id: string) => {
    setStrategies(prev => prev.filter(strategy => strategy.id !== id))
  }

  const updateCurrentStrategy = (updates: Partial<Strategy>) => {
    if (currentStrategy) {
      setCurrentStrategy({ ...currentStrategy, ...updates })
    }
  }

  return {
    strategies,
    strategyTypes,
    selectedStrategy,
    isBuilding,
    currentStrategy,
    startBuilding,
    saveStrategy,
    cancelBuilding,
    editStrategy,
    toggleStrategy,
    deleteStrategy,
    updateCurrentStrategy
  }
} 