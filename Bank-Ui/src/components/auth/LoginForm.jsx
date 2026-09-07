'use client'

import { useState } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole } from 'lucide-react'
import { agentProps } from '@/lib/agent'
import { BANK_NAME } from '@/lib/constants'
import { useAuth } from '@/hooks/use-auth'
import { Button, Input } from '@/components/ui'
import { BiometricButton } from './BiometricButton'

/**
 * Mock sign-in. Any input is accepted — the submit handler simply flips the
 * client-side session flag. No credentials are validated, stored or sent.
 */
export function LoginForm() {
  const { signIn } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [userId, setUserId] = useState('ayesha.siddiqui')
  const [password, setPassword] = useState('demo-password')
  return (
    <section className="surface-card p-5 md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow mb-1.5">Welcome back</p>
          <h2 className="heading-md">Sign in to {BANK_NAME}</h2>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-positive-50 text-positive-500">
          <LockKeyhole size={17} aria-hidden />
        </span>
      </div>

      <form
        className="mt-5 flex flex-col gap-4"
        onSubmit={(event) => {
          event.preventDefault()
          signIn()
        }}
      >
        <Input
          label="User ID or registered mobile"
          type="text"
          autoComplete="username"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="ayesha.siddiqui"
          required
          {...agentProps('login-email-input')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Enter your password"
          required
          {...agentProps('login-password-input')}
          trailing={
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              className="grid h-full w-11 shrink-0 place-items-center rounded-r-xl text-ink-muted transition-colors hover:text-brand-600"
              {...agentProps('login-password-toggle')}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          }
        />

        <div className="flex items-center justify-between gap-3">
          <label className="flex cursor-pointer items-center gap-2 type-secondary">
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 rounded border-line accent-brand-600"
              {...agentProps('login-remember-checkbox')}
            />
            Remember this device
          </label>
          <button
            type="button"
            className="text-[0.6875rem] font-bold text-brand-600 transition-colors hover:text-brand-700"
            {...agentProps('login-forgot-password')}
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" size="lg" fullWidth {...agentProps('login-submit')}>
          Sign in
          <ArrowRight size={17} aria-hidden />
        </Button>

        <BiometricButton onActivate={signIn} />
      </form>

      <p className="mt-5 text-center type-secondary">
        New to {BANK_NAME}?{' '}
        <button
          type="button"
          className="font-bold text-brand-600 transition-colors hover:text-brand-700"
          {...agentProps('login-open-account')}
        >
          Open an account
        </button>
      </p>
    </section>
  )
}
