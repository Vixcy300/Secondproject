/** Reusable loading spinner with optional label. */
interface Props {
  size?: "sm" | "md" | "lg";
  label?: string;
}

export default function LoadingSpinner({ size = "md", label }: Props) {
  const dims = { sm: "w-5 h-5", md: "w-8 h-8", lg: "w-12 h-12" }[size];
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <div
        className={`${dims} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      />
      {label && <p className="text-sm text-gray-500">{label}</p>}
    </div>
  );
}
