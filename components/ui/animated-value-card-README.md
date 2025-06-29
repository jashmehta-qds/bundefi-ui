# AnimatedValueCard Component

A highly customizable, animated card component for displaying financial metrics, progress tracking, and data visualization. Perfect for dashboards, analytics, and any application that needs to showcase numerical data with beautiful animations.

## Features

- 🎯 **Animated counters** - Smooth number animations with customizable duration
- 📊 **Progress visualization** - Color-coded progress bars with thresholds
- 🔄 **Flip card animation** - Optional back side for detailed breakdowns
- 💫 **Micro-interactions** - Hover effects, pulse animations, and smooth transitions
- 🎨 **Fully customizable** - Colors, icons, labels, and styling
- 📱 **Responsive design** - Works on all screen sizes
- ♿ **Accessible** - Screen reader friendly with proper ARIA labels
- 🔧 **TypeScript support** - Full type safety and IntelliSense

## Installation

The component uses the following dependencies:
- `framer-motion` - For animations
- `lucide-react` - For icons
- Your UI library components (Button, Card, Progress, etc.)

```bash
npm install framer-motion lucide-react
```

## Basic Usage

```tsx
import { AnimatedValueCard } from "@/components/ui/animated-value-card";
import { Wallet, TrendingUp } from "lucide-react";

function MyCard() {
  const primaryMetric = {
    label: "Active Investments",
    value: 125000,
    icon: TrendingUp,
    color: "text-emerald-500"
  };

  return (
    <AnimatedValueCard
      totalValue={150000}
      primaryValue={125000}
      utilizationPercentage={83.3}
      title="Investment Portfolio"
      titleIcon={Wallet}
      primaryMetric={primaryMetric}
    />
  );
}
```

## Props Reference

### Core Props (Required)

| Prop | Type | Description |
|------|------|-------------|
| `totalValue` | `number` | The main total value displayed prominently |
| `primaryValue` | `number` | Value for the first metric card |
| `utilizationPercentage` | `number` | Percentage for the progress bar (0-100) |
| `title` | `string` | Card title displayed in header |
| `primaryMetric` | `MetricCardData` | Configuration for the primary metric card |

### Optional Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `secondaryValue` | `number` | `0` | Value for the second metric card |
| `titleIcon` | `LucideIcon` | `Wallet` | Icon displayed next to title |
| `titleTooltip` | `string` | - | Tooltip text for the help icon |
| `currency` | `string` | `"$"` | Currency symbol to display |
| `secondaryMetric` | `MetricCardData` | - | Configuration for secondary metric card |

### Progress Bar Configuration

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `progressLabel` | `string` | `"Utilization"` | Label for the progress bar |
| `progressColors` | `object` | See below | Colors for different progress thresholds |

Default progress colors:
```tsx
{
  low: "bg-red-500",    // < 30%
  medium: "bg-yellow-500", // 30-60%
  high: "bg-emerald-500"   // > 60%
}
```

### Action Button

| Prop | Type | Description |
|------|------|-------------|
| `actionButton` | `object` | Configuration for the call-to-action button |

Action button structure:
```tsx
{
  show: boolean;           // Whether to show the button
  label: string;           // Button text
  onClick: () => void;     // Click handler
  gradient?: string;       // Custom CSS classes for styling
  pulseInterval?: number;  // Pulse animation interval in ms
}
```

### Asset Allocation (Flip Card)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `allocation` | `AllocationItem[]` | `[]` | Data for the allocation breakdown |
| `allocationTitle` | `string` | `"Asset Allocation"` | Title for the back of the card |
| `allocationTooltip` | `string` | Default tooltip | Tooltip for allocation info |
| `allocationColors` | `string[]` | Default colors | Colors for allocation bars |
| `enableFlipCard` | `boolean` | `true` | Enable/disable flip card functionality |

### Styling & Animation

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isLoading` | `boolean` | `false` | Show loading skeleton |
| `animationDuration` | `number` | `1500` | Counter animation duration in ms |
| `className` | `string` | `""` | Additional CSS classes |
| `cardHeight` | `string` | `"h-full"` | Height class for the card |

## Type Definitions

### MetricCardData
```tsx
interface MetricCardData {
  label: string;           // Display label
  value: number;           // Numeric value
  icon?: LucideIcon;       // Optional icon
  color?: string;          // CSS color class
  tooltip?: string;        // Optional tooltip
}
```

### AllocationItem
```tsx
interface AllocationItem {
  symbol: string;          // Asset symbol/name
  allocation: number;      // Percentage allocation
  value?: number;          // Optional dollar value
}
```

## Examples

### 1. Investment Portfolio Card
```tsx
<AnimatedValueCard
  totalValue={150000}
  primaryValue={125000}
  secondaryValue={25000}
  utilizationPercentage={83.3}
  title="Investment Portfolio"
  titleIcon={Wallet}
  titleTooltip="Your complete investment portfolio overview"
  primaryMetric={{
    label: "Active Investments",
    value: 125000,
    icon: TrendingUp,
    color: "text-emerald-500"
  }}
  secondaryMetric={{
    label: "Available Cash",
    value: 25000,
    icon: DollarSign,
    color: "text-blue-500"
  }}
  allocation={[
    { symbol: "STOCKS", allocation: 60, value: 90000 },
    { symbol: "BONDS", allocation: 25, value: 37500 },
    { symbol: "CRYPTO", allocation: 10, value: 15000 },
    { symbol: "CASH", allocation: 5, value: 7500 }
  ]}
  actionButton={{
    show: true,
    label: "Invest $25,000 Available Cash",
    onClick: () => navigateToInvestment(),
    pulseInterval: 5000
  }}
/>
```

### 2. Savings Goal Tracker
```tsx
<AnimatedValueCard
  totalValue={10000}
  primaryValue={7500}
  secondaryValue={2500}
  utilizationPercentage={75}
  title="Emergency Fund Goal"
  titleIcon={Shield}
  primaryMetric={{
    label: "Saved",
    value: 7500,
    icon: PiggyBank,
    color: "text-green-500"
  }}
  secondaryMetric={{
    label: "Remaining",
    value: 2500,
    icon: Target,
    color: "text-orange-500"
  }}
  progressLabel="Progress"
  progressColors={{
    low: "bg-red-400",
    medium: "bg-yellow-400",
    high: "bg-green-400"
  }}
  enableFlipCard={false}
/>
```

### 3. Business Revenue Dashboard
```tsx
<AnimatedValueCard
  totalValue={60000}
  primaryValue={45000}
  secondaryValue={15000}
  utilizationPercentage={75}
  title="Monthly Revenue"
  titleIcon={BarChart3}
  primaryMetric={{
    label: "Monthly Revenue",
    value: 45000,
    icon: BarChart3,
    color: "text-blue-500"
  }}
  secondaryMetric={{
    label: "Growth Potential",
    value: 15000,
    icon: Zap,
    color: "text-purple-500"
  }}
  allocation={[
    { symbol: "SUBSCRIPTIONS", allocation: 65, value: 29250 },
    { symbol: "ONE-TIME", allocation: 20, value: 9000 },
    { symbol: "CONSULTING", allocation: 15, value: 6750 }
  ]}
  allocationTitle="Revenue Streams"
  actionButton={{
    show: true,
    label: "Optimize for +$15K Revenue",
    onClick: () => openOptimization(),
    gradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
  }}
/>
```

### 4. Minimal Budget Card
```tsx
<AnimatedValueCard
  totalValue={3500}
  primaryValue={2800}
  utilizationPercentage={80}
  title="Monthly Budget"
  titleIcon={Wallet}
  primaryMetric={{
    label: "Spent",
    value: 2800,
    icon: DollarSign,
    color: "text-red-500"
  }}
  progressLabel="Budget Used"
  enableFlipCard={false}
  cardHeight="h-80"
/>
```

## Customization Tips

### Custom Colors
You can customize colors by passing Tailwind CSS classes:
```tsx
progressColors={{
  low: "bg-rose-500",
  medium: "bg-amber-500", 
  high: "bg-emerald-500"
}}
```

### Custom Gradients
For action buttons, use Tailwind gradient classes:
```tsx
actionButton={{
  gradient: "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
}}
```

### Animation Timing
Adjust animation speeds for different effects:
```tsx
animationDuration={2500} // Slower, more dramatic
animationDuration={800}  // Faster, snappier
```

## Accessibility

The component includes:
- Proper ARIA labels for screen readers
- Keyboard navigation support
- High contrast color options
- Semantic HTML structure
- Focus management for interactive elements

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+
- Mobile browsers with CSS transforms support

## Contributing

When extending this component:
1. Maintain TypeScript interfaces
2. Add proper prop validation
3. Include accessibility features
4. Test animations on different devices
5. Update this documentation

## License

This component is part of your UI library and follows the same license terms. 