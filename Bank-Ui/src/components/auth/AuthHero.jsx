import { ShieldCheck } from 'lucide-react'
import { BANK_TAGLINE } from '@/lib/constants'
import { BrandMark } from '@/components/common/BrandMark'

/**
 * The branded panel above the sign-in card. On a phone it is a compact header;
 * from `md` up it becomes the left half of a two-column layout.
 */
export function AuthHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 px-6 py-8 text-white shadow-brand md:px-8 md:py-12">
      <span
        aria-hidden
        className="absolute -right-16 -top-24 h-56 w-56 rounded-full border border-white/10"
      />
      <span
        aria-hidden
        className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full border border-accent-300/20"
      />
      <div className="relative">
        <BrandMark inverted size="md" />
        <p className="mt-6 text-2xs font-bold uppercase tracking-eyebrow text-accent-200">
          Personal banking, reimagined
        </p>
        <h1 className="mt-2 font-display text-[1.75rem] font-extrabold leading-[1.1] tracking-[-0.035em] md:text-[2.5rem]">
          Money that moves
          <br />
          <span className="text-accent-200">with you.</span>
        </h1>
        <p className="mt-3 max-w-sm text-xs leading-relaxed text-white/75 md:text-sm">
          {BANK_TAGLINE} A clearer view of your everyday finances, built to help you decide with confidence.
        </p>
        <p className="mt-6 flex items-center gap-2 text-2xs font-semibold text-accent-200">
          <ShieldCheck size={16} aria-hidden />
          Bank-grade security, always on.
        </p>
      </div>
    </section>
  )
}
