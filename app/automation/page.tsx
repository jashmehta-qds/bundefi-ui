"use client"

import { StrategiesList, StrategyBuilder, StrategyTypeCard } from "@/components/features/automation"
import { useAutomation } from "@/lib/hooks"

export default function AutomationPage() {
  const {
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
  } = useAutomation()

  const selectedStrategyType = strategyTypes.find(s => s.type === selectedStrategy)

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-muted/40">
        <div className="container py-6 md:py-8">

          {!isBuilding ? (
            <>
              {/* Strategy Types */}
              <div className="grid gap-6 md:grid-cols-3 mb-8">
                {strategyTypes.map((strategyType) => (
                  <StrategyTypeCard
                    key={strategyType.type}
                    {...strategyType}
                    onSelect={startBuilding}
                  />
                ))}
              </div>

              {/* Existing Strategies */}
              <StrategiesList
                strategies={strategies}
                strategyTypes={strategyTypes}
                onEdit={editStrategy}
                onToggle={toggleStrategy}
                onDelete={deleteStrategy}
              />
            </>
          ) : (
            currentStrategy && selectedStrategyType && (
              <StrategyBuilder
                strategy={currentStrategy}
                strategyType={selectedStrategyType}
                onStrategyChange={updateCurrentStrategy}
                onSave={saveStrategy}
                onCancel={cancelBuilding}
              />
            )
          )}
        </div>
      </main>
    </div>
  )
} 