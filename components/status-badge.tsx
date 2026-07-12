export function StatusBadge({ status }: { status: string }) {
  const color =
    status === "verified"
      ? "bg-emerald-500/20 text-emerald-300"
      : status === "rejected"
        ? "bg-red-500/20 text-red-300"
        : "bg-yellow-500/20 text-yellow-200";
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${color}`}>
      {status}
    </span>
  );
}
