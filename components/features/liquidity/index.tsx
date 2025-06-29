"use client";

import { motion, Variants } from "framer-motion";
import { Card, CardContent } from "../../ui/card";
import { ConfirmationScreen } from "./ConfirmationScreen";
import { FinalScreen } from "./FinalScreen";
import { FooterButtons } from "./FooterButtons";
import { InputForm } from "./InputForm";
import { LiquidityManagerProvider, useLiquidityManagerContext } from "./LiquidityManagerContext";
import { StepIndicator } from "./StepIndicator";
import { LiquidityManagerProps } from "./types";

// Animation variants for the stepper
const stepperVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -500 : 500,
    opacity: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 30,
    },
  }),
};

export function LiquidityManager({
  existingPosition,
  setOpen,
  action,
}: LiquidityManagerProps) {
  return (
    <LiquidityManagerProvider
      existingPosition={existingPosition}
      setOpen={setOpen}
      action={action}
    >
      <LiquidityManagerContent />
    </LiquidityManagerProvider>
  );
}

function LiquidityManagerContent() {
  const {
    stepperState,
  } = useLiquidityManagerContext();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="pt-6 h-[500px] overflow-hidden flex flex-col">
        <StepIndicator />

        <motion.div
          key={stepperState.currentStep}
          custom={stepperState.direction}
          variants={stepperVariants as Variants}
          initial="enter"
          animate="center"
          exit="exit"
          className="overflow-y-auto flex-grow"
        >
          {stepperState.currentStep === 0 ? (
            <InputForm />
          ) : stepperState.currentStep === 1 ? (
            <ConfirmationScreen />
          ) : (
            <FinalScreen />
          )}
        </motion.div>

        <div className="mt-auto pt-4 border-t">
          <FooterButtons />
        </div>
      </CardContent>
    </Card>
  );
} 