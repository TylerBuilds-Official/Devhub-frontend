import type { ParamInfo } from '../../types/upstream'


interface ParamInputProps {
  param:     ParamInfo
  value:     string | boolean | number
  onChange:  (next: string | boolean | number) => void
  error?:    string | null
}


/**
 * Dispatches a ParamInfo to the right input element based on its type.
 * All values are held as their natural JS type; the submit step serializes.
 */
export default function ParamInput({ param, value, onChange, error }: ParamInputProps) {

  if (param.type === 'bool') {

    return (
      <label className="deploy-param-bool">
        <input
          type="checkbox"
          checked={Boolean(value)}
          onChange={e => onChange(e.target.checked)}
        />
        <span className="deploy-param-bool-label">{param.label}</span>
      </label>
    )
  }

  if (param.type === 'int') {

    return (
      <input
        type="number"
        className={`deploy-param-input ${error ? 'has-error' : ''}`}
        placeholder={param.placeholder ?? ''}
        value={value === '' ? '' : String(value)}
        onChange={e => {
          const v = e.target.value
          onChange(v === '' ? '' : Number(v))
        }}
      />
    )
  }

  // Default: string
  return (
    <input
      type="text"
      className={`deploy-param-input ${error ? 'has-error' : ''}`}
      placeholder={param.placeholder ?? ''}
      value={String(value ?? '')}
      onChange={e => onChange(e.target.value)}
    />
  )
}
