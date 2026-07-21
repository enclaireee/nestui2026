import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function GlassCard({ children, className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/20 bg-white/[0.14] p-6 md:p-10 shadow-2xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
