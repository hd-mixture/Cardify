
"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2 } from "lucide-react"

const templates = [
  { id: "template-1", name: "Classic Split", layout: <div className="flex h-full w-full"><div className="w-1/3 bg-slate-300 rounded-l-sm"></div><div className="w-2/3 bg-slate-200 rounded-r-sm"></div></div> },
  { id: "template-2", name: "Top Header", layout: <div className="flex flex-col h-full w-full"><div className="h-1/3 bg-slate-300 rounded-t-sm"></div><div className="h-2/3 bg-slate-200 rounded-b-sm"></div></div> },
  { id: "template-3", name: "Centered Minimal", layout: <div className="flex items-center justify-center h-full w-full bg-slate-200 rounded-sm"><div className="h-1/2 w-1/2 bg-slate-300 rounded-sm"></div></div> },
  { id: "template-4", name: "Modern Vertical", layout: <div className="flex h-full w-full"><div className="w-1/4 bg-slate-300 rounded-l-sm"></div><div className="w-3/4 bg-slate-200 rounded-r-sm"></div></div> },
  { id: "template-5", name: "Elegant Overlay", layout: <div className="relative h-full w-full bg-slate-400 rounded-sm"><div className="absolute bottom-2 left-2 right-2 h-1/2 bg-slate-200/50 backdrop-blur-sm rounded-sm"></div></div> },
  { id: "template-6", name: "Bold Graphic", layout: <div className="flex h-full w-full"><div className="w-2/5 bg-slate-300 rounded-l-sm"></div><div className="w-3/5 bg-slate-200 rounded-r-sm"></div></div> },
  { id: "template-7", name: "Photo Focus", layout: <div className="flex flex-col h-full w-full"><div className="h-1/3 bg-slate-300 rounded-t-sm"></div><div className="h-2/3 bg-slate-200 rounded-b-sm flex items-end p-1"><div className="w-full h-1/3 bg-slate-300 rounded-sm"></div></div></div> },
  { id: "template-8", name: "Minimalist Text", layout: <div className="flex h-full w-full"><div className="w-1/3 bg-slate-200 rounded-l-sm"></div><div className="w-2/3 bg-slate-300 rounded-r-sm"></div></div> },
  { id: "template-9", name: "Creative Gradient", layout: <div className="h-full w-full bg-gradient-to-br from-slate-200 to-slate-400 rounded-sm"></div> },
]

interface TemplatePickerProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TemplatePicker({ value, onChange, className }: TemplatePickerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [highlighterStyle, setHighlighterStyle] = React.useState<React.CSSProperties>({ opacity: 0 });

  React.useLayoutEffect(() => {
    const calculateStyle = () => {
      if (!containerRef.current || !value) {
        setHighlighterStyle({ opacity: 0 });
        return;
      }
      
      const selectedItem = containerRef.current.querySelector(`[data-template-id="${value}"]`) as HTMLDivElement | null;
      
      if (selectedItem) {
        setHighlighterStyle({
          transform: `translate(${selectedItem.offsetLeft}px, ${selectedItem.offsetTop}px)`,
          width: `${selectedItem.offsetWidth}px`,
          height: `${selectedItem.offsetHeight}px`,
          opacity: 1,
        });
      }
    }
    
    calculateStyle();
    window.addEventListener('resize', calculateStyle);
    return () => window.removeEventListener('resize', calculateStyle);
  }, [value]);

  return (
    <div className="relative">
      <div
        className="absolute rounded-lg border-2 border-primary transition-all duration-300 ease-in-out pointer-events-none"
        style={highlighterStyle}
      />
      <div
        ref={containerRef}
        className={cn("grid grid-cols-3 gap-2", className)}
      >
        {templates.map((template) => (
          <div
            key={template.id}
            data-template-id={template.id}
            className="relative cursor-pointer rounded-lg border-2 border-transparent bg-card p-2 transition-colors hover:bg-accent/50"
            onClick={() => onChange(template.id)}
          >
             {value === template.id && (
                <CheckCircle2 className="absolute top-1 right-1 h-5 w-5 text-primary bg-white rounded-full z-10" />
            )}
            <div className="h-14 w-full overflow-hidden rounded-md border pointer-events-none">
              {template.layout}
            </div>
            <span className="mt-2 block text-center text-xs font-medium pointer-events-none">{template.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
