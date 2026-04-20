import { useState, useCallback }   from 'react'
import { Trash2, Plus }            from 'lucide-react'

import Header                      from '../components/global/Header'
import EmptyState                  from '../components/global/EmptyState'
import RefreshButton               from '../components/global/RefreshButton'
import { TableRowSkeleton }        from '../components/global/Skeleton'
import { useToast }                from '../components/global/ToastProvider'
import { useApi }                  from '../hooks/useApi'
import { useMe }                   from '../auth/MeContext'
import { absoluteTime }            from '../utils/time'
import { listUsers, createUser, updateUser, deleteUser } from '../api/users'
import { ApiError }                from '../api/client'
import type { Role }               from '../types/me'


export default function UsersPage() {
  const me    = useMe()
  const toast = useToast()

  const {
    data:    usersData,
    loading,
    error,
    refetch,
  } = useApi(() => listUsers(), [])

  const [formEmail, setFormEmail] = useState('')
  const [formRole,  setFormRole]  = useState<Role>('viewer')
  const [formNotes, setFormNotes] = useState('')
  const [formBusy,  setFormBusy]  = useState(false)

  const users = usersData?.users ?? []

  const addUser = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setFormBusy(true)

    const email = formEmail.trim()

    try {
      await createUser({
        email,
        role:  formRole,
        notes: formNotes.trim() || null,
      })
      setFormEmail('')
      setFormRole('viewer')
      setFormNotes('')
      refetch()
      toast.success(`Added ${email} as ${formRole}`)
    }
    catch (err) {
      toast.error(err instanceof ApiError ? err.detail : String(err))
    }
    finally {
      setFormBusy(false)
    }
  }, [formEmail, formRole, formNotes, refetch, toast])

  const changeRole = useCallback(async (email: string, role: Role) => {
    try {
      await updateUser(email, { role })
      refetch()
      toast.success(`${email} is now ${role}`)
    }
    catch (err) {
      toast.error(err instanceof ApiError ? err.detail : String(err))
    }
  }, [refetch, toast])

  const removeUser = useCallback(async (email: string) => {
    if (!window.confirm(`Remove ${email} from DevHub access?`)) return

    try {
      await deleteUser(email)
      refetch()
      toast.success(`Removed ${email}`)
    }
    catch (err) {
      toast.error(err instanceof ApiError ? err.detail : String(err))
    }
  }, [refetch, toast])

  return (
    <>
      <Header title="Users" subtitle="Access control">
        <RefreshButton onClick={refetch} spinning={loading} />
      </Header>

      <div className="users-page">

        {/* ── Add-user form ────────────────────────────────────────── */}
        <form className="users-add-form" onSubmit={addUser}>
          <div className="users-add-form-fields">
            <div className="users-add-field">
              <span className="label">Email</span>
              <input
                type="email"
                required
                value={formEmail}
                onChange={e => setFormEmail(e.target.value)}
                placeholder="someone@metalsfab.com"
              />
            </div>

            <div className="users-add-field">
              <span className="label">Role</span>
              <select value={formRole} onChange={e => setFormRole(e.target.value as Role)}>
                <option value="viewer">viewer</option>
                <option value="admin">admin</option>
              </select>
            </div>

            <div className="users-add-field users-add-field-grow">
              <span className="label">Notes (optional)</span>
              <input
                type="text"
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                placeholder="why / when / who approved"
              />
            </div>

            <button className="btn-primary" type="submit" disabled={formBusy}>
              <Plus size={14} />
              {formBusy ? 'Adding…' : 'Add user'}
            </button>
          </div>

        </form>

        {/* ── User table ───────────────────────────────────────────── */}
        {error && !usersData && (
          <EmptyState title="Couldn't load users" message={error} />
        )}

        {!error && (loading && !usersData || usersData) && (
          <table className="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Role</th>
                <th>Added</th>
                <th>By</th>
                <th>Notes</th>
                <th aria-label="Actions" />
              </tr>
            </thead>
            <tbody>
              {!usersData && <TableRowSkeleton rows={4} columns={6} />}

              {usersData && users.map(u => {
                const isSelf = u.email === me.email

                return (
                  <tr key={u.email} className={isSelf ? 'is-self' : ''}>
                    <td>
                      {u.email}
                      {isSelf && <span className="users-self-marker">you</span>}
                    </td>
                    <td>
                      <select
                        className={`users-role-select ${u.role}`}
                        value={u.role}
                        onChange={e => changeRole(u.email, e.target.value as Role)}
                        disabled={isSelf}
                        title={isSelf ? "You can't demote yourself." : undefined}
                      >
                        <option value="viewer">viewer</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="users-dim">{absoluteTime(u.created_at)}</td>
                    <td className="users-dim">{u.created_by ?? '—'}</td>
                    <td className="users-dim users-notes">{u.notes ?? '—'}</td>
                    <td className="users-row-actions">
                      <button
                        className="users-delete-btn"
                        onClick={() => removeUser(u.email)}
                        disabled={isSelf}
                        title={isSelf ? "You can't delete yourself." : 'Remove user'}
                        aria-label={`Remove ${u.email}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}

        {usersData && users.length === 0 && (
          <EmptyState title="No users" message="Add the first user above." />
        )}
      </div>
    </>
  )
}
