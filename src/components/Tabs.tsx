import React from "react"
import * as TabsPrimitives from "@radix-ui/react-tabs"
import { cx, focusRing } from "../lib/utils"

type TabsOrientation = "horizontal" | "vertical"
type TabsListVariant = "line" | "solid"

interface TabsProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitives.Root> {}

const Tabs = ({ orientation = "horizontal", ...props }: TabsProps) => {
  return <TabsPrimitives.Root tremor-id="tremor-raw" orientation={orientation} {...props} />
}
Tabs.displayName = "Tabs"

const TabsListVariantContext = React.createContext<TabsListVariant>("line")
const TabsOrientationContext = React.createContext<TabsOrientation>("horizontal")

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitives.List> {
  variant?: TabsListVariant
  orientation?: TabsOrientation
}

const variantStyles: Record<TabsListVariant, Record<TabsOrientation, string>> = {
  line: {
    horizontal: cx("flex items-center justify-start border-b border-gray-200 dark:border-gray-800"),
    vertical: cx("flex flex-col border-gray-200 dark:border-gray-800"),
  },
  solid: {
    horizontal: cx("inline-flex items-center justify-center rounded-md p-1 bg-gray-100 dark:bg-gray-900"),
    vertical: cx("inline-flex flex-col items-start justify-start rounded-md p-1 bg-gray-100 dark:bg-gray-900"),
  },
}

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.List>,
  TabsListProps
>(({ className, variant = "line", orientation = "horizontal", children, ...props }, forwardedRef) => (
  <TabsOrientationContext.Provider value={orientation}>
    <TabsListVariantContext.Provider value={variant}>
      <TabsPrimitives.List
        ref={forwardedRef}
        className={cx(variantStyles[variant][orientation], className)}
        {...props}
      >
        {children}
      </TabsPrimitives.List>
    </TabsListVariantContext.Provider>
  </TabsOrientationContext.Provider>
))
TabsList.displayName = "TabsList"

function getVariantStyles(variant: TabsListVariant, orientation: TabsOrientation) {
  if (variant === "line") {
    return cx(
      orientation === "horizontal"
        ? "-mb-px border-b-2 pb-2 px-3 min-w-[200px]"
        : "border-l-2 p-10 py-2 data-[state=active]:bg-gray-100 data-[state=active]:rounded-r-md",
      "items-center justify-center whitespace-nowrap border-transparent text-sm font-medium transition-all",
      "text-gray-500 dark:text-gray-500",
      "hover:text-gray-700 hover:dark:text-gray-400",
      "hover:border-gray-300 hover:dark:border-gray-400",
      "data-[state=active]:border-[#0f083a] data-[state=active]:text-[#0f083a]",
      "data-[state=active]:dark:border-[#0f083a] data-[state=active]:dark:text-[#0f083a]",
      "data-[disabled]:pointer-events-none",
      "data-[disabled]:text-gray-300 data-[disabled]:dark:text-gray-700",
    )
  }

  if (variant === "solid") {
    return cx(
      "inline-flex items-center justify-center whitespace-nowrap rounded px-3 py-1 text-sm font-medium ring-1 ring-inset transition-all",
      "text-gray-500 dark:text-gray-400",
      "hover:text-gray-700 hover:dark:text-gray-200",
      "ring-transparent",
      "data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=active]:shadow",
      "data-[state=active]:dark:bg-gray-950 data-[state=active]:dark:text-gray-50",
      "data-[disabled]:pointer-events-none data-[disabled]:text-gray-400 data-[disabled]:opacity-50 data-[disabled]:dark:text-gray-600",
    )
  }

  return ""
}

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Trigger>
>(({ className, children, ...props }, forwardedRef) => {
  const variant = React.useContext(TabsListVariantContext)
  const orientation = React.useContext(TabsOrientationContext)

  return (
    <TabsPrimitives.Trigger
      ref={forwardedRef}
      className={cx(getVariantStyles(variant, orientation), focusRing, className)}
      {...props}
    >
      {children}
    </TabsPrimitives.Trigger>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Content>
>(({ className, ...props }, forwardedRef) => (
  <TabsPrimitives.Content
    ref={forwardedRef}
    className={cx("outline-none", focusRing, className)}
    {...props}
  />
))
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }