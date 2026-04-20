/**
 * UserChip — header dropdown showing signed-in user + sign-out action.
 */
import { useEffect, useRef, useState } from 'react'
import { useMsal }                     from '@azure/msal-react'

import { useMe }                       from '../../auth/MeContext'


export default function UserChip() {
  const me                    = useMe()
  const { instance }          = useMsal()
  const [open, setOpen]       = useState(false)
  const containerRef          = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return

    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  function handleSignOut() {
    instance.logoutRedirect({
      account:              instance.getActiveAccount() ?? undefined,
      postLogoutRedirectUri: window.location.origin,
    })
  }

  const label = me.display_name || me.email

  return (
    <div ref={containerRef}>
      <button
        className="user-chip"
        onClick={() => setOpen(v => !v)}
      >
        <span>{label}</span>
        <span className={`user-chip-role ${me.role}`}>{me.role}</span>
      </button>

      {open && (
        <div className="user-menu">
          <div className="user-menu-info">
            <strong>{me.display_name}</strong>
            <span>{me.email}</span>
          </div>
          <button onClick={handleSignOut}>Sign out</button>
        </div>
      )}
    </div>
  )
}
