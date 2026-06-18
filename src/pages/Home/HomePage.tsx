import {
  ArrowRight, Calculator, ClipboardList, Fence, Hammer, Scissors, Sparkles
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const tools = [
  {
    title: "Gate Calculator",
    description: "Design, visualise and create an accurate cut list for a timber gate.",
    icon: Calculator,
    href: "/gate-calculator",
    active: true
  },
  {
    title: "Fence Run Designer",
    description: "Plan post spacing, bays, slopes and panel arrangements.",
    icon: Fence
  },
  {
    title: "Material Estimator",
    description: "Turn site dimensions into a complete materials schedule.",
    icon: Hammer
  },
  {
    title: "Quote Builder",
    description: "Build clear customer quotes from labour and material costs.",
    icon: ClipboardList
  },
  {
    title: "Cut Optimiser",
    description: "Reduce timber waste with intelligent stock cutting plans.",
    icon: Scissors
  }
];

export function HomePage() {
  return (
    <div className="page-shell py-10 sm:py-16">
      <section className="max-w-3xl">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-forest-100 bg-white/70 px-3 py-1.5 text-xs font-bold text-forest-700">
          <Sparkles size={14} /> Built for the job site
        </div>
        <h1 className="text-4xl font-black tracking-[-0.04em] text-forest-950 sm:text-6xl">
          Fencing Site Assistant
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-stone-600 sm:text-xl">
          Professional fencing calculations, design tools and site management.
        </p>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3">
        {tools.map((tool, index) => {
          const Icon = tool.icon;
          return (
            <Card
              key={tool.title}
              className={tool.active ? "relative overflow-hidden border-forest-100 bg-forest-950 text-white sm:col-span-2 lg:col-span-1" : ""}
            >
              <div className="p-6 sm:p-7">
                <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tool.active ? "bg-white/10 text-timber-400" : "bg-forest-50 text-forest-700"}`}>
                  <Icon size={24} />
                </div>
                <div className="mt-7 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{tool.title}</h2>
                  {!tool.active && (
                    <span className="rounded-full bg-stone-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-stone-500">
                      Coming soon
                    </span>
                  )}
                </div>
                <p className={`mt-3 min-h-12 text-sm leading-6 ${tool.active ? "text-white/65" : "text-stone-500"}`}>
                  {tool.description}
                </p>
                {tool.active ? (
                  <Button asChild variant="timber" className="mt-6 w-full">
                    <Link to={tool.href!}>Open tool <ArrowRight size={17} /></Link>
                  </Button>
                ) : (
                  <Button disabled variant="outline" className="mt-6 w-full">
                    Tool {index + 1}
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
