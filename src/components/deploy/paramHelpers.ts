import type { ParamInfo, PipelineInfo } from '../../types/upstream'


export type ParamValue = string | boolean | number


/**
 * Build the initial values dict for a pipeline's params.
 * Respects defaults when present; empty string for strings, false for bool,
 * empty string (to avoid NaN inputs) for int.
 */
export function initialParamValues(pipeline: PipelineInfo): Record<string, ParamValue> {
  const values: Record<string, ParamValue> = {}

  for (const param of pipeline.params) {
    if (param.default !== undefined && param.default !== null) {
      values[param.name] = param.default as ParamValue
      continue
    }

    if (param.type === 'bool')     { values[param.name] = false; continue }
    if (param.type === 'int')      { values[param.name] = ''; continue }
    /* string default */             values[param.name] = ''
  }

  return values
}


/**
 * Validate all params against their definitions.
 * Returns a dict of { paramName: errorMessage } — empty if valid.
 */
export function validateParams(
  params: ParamInfo[],
  values: Record<string, ParamValue>,
): Record<string, string> {

  const errors: Record<string, string> = {}

  for (const param of params) {
    const v = values[param.name]

    if (param.required) {
      if (param.type === 'str'  && (v === '' || v == null)) {
        errors[param.name] = 'Required'
        continue
      }
      if (param.type === 'int'  && (v === '' || v == null)) {
        errors[param.name] = 'Required'
        continue
      }
    }

    if (param.type === 'int' && v !== '' && v != null && Number.isNaN(Number(v))) {
      errors[param.name] = 'Must be a number'
    }
  }

  return errors
}


/**
 * Coerce params dict to the shape the backend expects.
 * Strip empty-string values for non-required fields so they don't override defaults.
 */
export function serializeParams(
  params: ParamInfo[],
  values: Record<string, ParamValue>,
): Record<string, unknown> {

  const out: Record<string, unknown> = {}

  for (const param of params) {
    const v = values[param.name]

    if (!param.required && (v === '' || v == null)) continue

    if (param.type === 'int') {
      out[param.name] = v === '' ? null : Number(v)
    } else {
      out[param.name] = v
    }
  }

  return out
}
