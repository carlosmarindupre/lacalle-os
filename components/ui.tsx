"use client";

import Link from "next/link";
import { ReactNode, useState } from "react";

export function PageHeader({
  kicker,
  title,
  desc,
  right,
}: {
  kicker?: string;
  title: string;
  desc?: string;
  right?: ReactNode;
}) {
  return (
    <header className="mb-8 flex items-end justify-between gap-6">
      <div>
        {kicker && (
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.25em] text-turquesa">
            {kicker}
          </div>
        )}
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
        {desc && <p className="mt-2 max-w-2xl text-sm text-mut">{desc}</p>}
      </div>
      {right}
    </header>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-line bg-panel p-5 ${className}`}>
      {children}
    </div>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2 text-[10px] uppercase tracking-[0.18em] text-mut">
      {children}
    </div>
  );
}

const inputBase =
  "w-full rounded-md border border-line bg-panel2 px-3 py-2 text-sm text-snow placeholder:text-dim transition-colors focus:border-turquesa";

export function TextInput({
  value,
  onChange,
  placeholder,
  className = "",
  type = "text",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
  type?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`${inputBase} ${className}`}
    />
  );
}

export function Area({
  value,
  onChange,
  placeholder,
  rows = 4,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`${inputBase} resize-y leading-relaxed`}
    />
  );
}

export function Select({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly string[];
  className?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`rounded-md border border-line bg-panel2 px-2 py-1.5 text-xs text-snow transition-colors focus:border-turquesa ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
        checked ? "bg-turquesa" : "bg-line2"
      }`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 h-4 w-4 rounded-full bg-ink transition-transform ${
          checked ? "translate-x-[18px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function ListEditor({
  items,
  onChange,
  placeholder = "Agregar…",
  accent = "turquesa",
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  accent?: "turquesa" | "magenta" | "gris";
}) {
  const [draft, setDraft] = useState("");
  const bullet =
    accent === "magenta"
      ? "bg-magenta"
      : accent === "gris"
        ? "bg-mut"
        : "bg-turquesa";

  const add = () => {
    const v = draft.trim();
    if (!v) return;
    onChange([...items, v]);
    setDraft("");
  };

  return (
    <div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li
            key={`${item}-${i}`}
            className="group flex items-center gap-2.5 rounded-md border border-transparent px-2 py-1 text-sm hover:border-line"
          >
            <span className={`h-1.5 w-1.5 shrink-0 ${bullet}`} />
            <span className="flex-1">{item}</span>
            <button
              onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="text-dim opacity-0 transition-opacity hover:text-magenta group-hover:opacity-100"
              aria-label="Eliminar"
            >
              ×
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder={placeholder}
          className="flex-1 rounded-md border border-line bg-panel2 px-3 py-1.5 text-sm placeholder:text-dim transition-colors focus:border-turquesa"
        />
        <button
          onClick={add}
          className="rounded-md border border-line px-3 text-sm text-mut transition-colors hover:border-turquesa hover:text-turquesa"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <Card className="flex flex-col gap-1">
      <Label>{label}</Label>
      <div
        className={`font-mono text-2xl font-medium tracking-tight md:text-3xl ${
          accent ? "text-turquesa" : "text-snow"
        }`}
      >
        {value}
      </div>
      {sub && <div className="text-xs text-dim">{sub}</div>}
    </Card>
  );
}

export function Tabs({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly string[];
  active: string;
  onChange: (t: string) => void;
}) {
  return (
    <div className="mb-8 flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`whitespace-nowrap border-b-2 px-4 py-2.5 text-[13px] transition-colors ${
            t === active
              ? "border-turquesa text-snow"
              : "border-transparent text-mut hover:text-snow"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-md border border-dashed border-line2 px-4 py-6 text-center text-xs text-dim">
      {children}
    </div>
  );
}

// Fila de un panel de "contexto conectado": muestra un dato traído de otro
// módulo, o un link para ir a completarlo donde corresponde.
export function FilaContexto({
  label,
  valor,
  href,
}: {
  label: string;
  valor: string;
  href: string;
}) {
  return (
    <div className="flex items-baseline gap-2 py-1">
      <span className="w-36 shrink-0 text-[10px] uppercase tracking-wider text-dim">
        {label}
      </span>
      {valor ? (
        <span className="truncate text-xs text-snow">{valor}</span>
      ) : (
        <Link
          href={href}
          className="text-xs text-dim underline decoration-line2 transition-colors hover:text-turquesa"
        >
          completar →
        </Link>
      )}
    </div>
  );
}
