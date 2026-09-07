import Link from 'next/link'
import { agentProps } from '@/lib/agent'
import { SERVICE_LINKS } from '@/lib/constants'

/** Secondary services that do not warrant a bottom-nav slot. */
export function ServiceGrid() {
  return (
    <section aria-labelledby="services-heading">
      <div className="mb-3">
        <p className="eyebrow mb-1">Everyday banking</p>
        <h2 id="services-heading" className="heading-md">
          Services
        </h2>
      </div>
      <ul className="grid grid-cols-3 gap-2">
        {SERVICE_LINKS.map((service) => {
          const Icon = service.icon
          return (
            <li key={service.href}>
              <Link
                href={service.href}
                className="flex h-full flex-col items-center gap-2 rounded-2xl border border-line bg-surface px-2 py-3.5 text-center shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-lift"
                {...agentProps(service.agentId)}
              >
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent-100 text-accent-600">
                  <Icon size={17} aria-hidden />
                </span>
                <span className="text-[0.625rem] font-semibold leading-tight text-ink">{service.label}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
