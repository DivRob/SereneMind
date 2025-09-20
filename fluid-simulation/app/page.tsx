import { FluidCanvas } from "@/components/fluid-canvas"

export default function Home() {
  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8 z-10">
        <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-4 text-balance">
          Fluid
          <span className="bg-gradient-to-r from-primary via-accent to-chart-2 bg-clip-text text-transparent">
            {" "}
            Dynamics
          </span>
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground font-light max-w-2xl text-pretty">
          Create mesmerizing fluid patterns with advanced particle physics. Drag to paint with liquid light.
        </p>
      </div>

      {/* Canvas Container */}
      <div className="w-full max-w-6xl h-[70vh] min-h-[500px]">
        <FluidCanvas className="w-full h-full" />
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Built with advanced particle physics • Touch and drag to interact
        </p>
      </div>
    </main>
  )
}
