import React from "react";

export default function PrimaryButton({
  children,
  className = "",
  variant = "primary",
  ...props
}) {
  const styles =
    variant === "secondary"
      ? "bg-white text-emerald-600 border-2 border-emerald-200 shadow-md"
      : "bg-emerald-500 text-white shadow-lg shadow-emerald-400/40";

  return (
    <button
      className={`w-full rounded-3xl px-6 py-4 text-lg font-semibold transition-transform duration-200 hover:scale-[1.03] active:scale-95 ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}


