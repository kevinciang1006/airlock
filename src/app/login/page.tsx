import { AuthForm } from "./auth-form";
import { Logo } from "@/components/primitives/logo";
import { CopyButton } from "@/components/primitives/copy-button";

const DEMO = [
  { label: "Acme (owner)", email: "demo@airlock.dev" },
  { label: "Globex (owner)", email: "globex@airlock.dev" },
  { label: "Acme (member)", email: "member@airlock.dev" },
];

function DemoCredentials() {
  return (
    <div className="mt-7 rounded-lg border border-line bg-wash-hover p-3.5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-faint">
        Demo logins · password <span className="font-mono">AirlockDemo123!</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {DEMO.map((c) => (
          <div key={c.email} className="flex items-center gap-2 text-[13px]">
            <span className="w-[104px] text-muted">{c.label}</span>
            <span className="flex-1 font-mono text-label">{c.email}</span>
            <CopyButton value={c.email} />
          </div>
        ))}
        <div className="flex items-center gap-2 text-[13px]">
          <span className="w-[104px] text-muted">Password</span>
          <span className="flex-1 font-mono text-label">AirlockDemo123!</span>
          <CopyButton value="AirlockDemo123!" />
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-[100] flex bg-paper">
      {/* Left — form */}
      <div className="flex flex-1 items-center justify-center overflow-y-auto p-8">
        <div className="w-full max-w-[400px] animate-reveal py-8">
          <Logo className="mb-8" />
          <AuthForm />
          <DemoCredentials />
        </div>
      </div>

      {/* Right — dark brand panel (hidden on narrow screens) */}
      <div className="hidden flex-1 flex-col justify-between bg-panel p-14 text-white min-[1000px]:flex">
        <div className="font-mono text-[12px] tracking-[.04em] text-[#B0B7C3]">
          SECURE · MULTI-TENANT · RLS-ENFORCED
        </div>
        <div>
          <div className="max-w-[420px] font-display text-[34px] font-semibold leading-[1.15] tracking-[-.02em]">
            One console. Every tenant, perfectly isolated.
          </div>
          <div className="mt-4 max-w-[400px] text-[15px] text-[#98A2B3]">
            Access control that&apos;s felt, not stated. Row-level security on every query, scoped to the org
            you&apos;re acting in.
          </div>
        </div>
        <div className="font-mono text-[12px] text-[#667085]">
          acting in: <span className="text-[#E9A23B]">acme</span>
        </div>
      </div>
    </div>
  );
}
