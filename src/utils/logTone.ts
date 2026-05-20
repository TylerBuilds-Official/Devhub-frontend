export type LogTone = 'error' | 'warning' | 'success' | 'info' | 'muted'

export interface LogDisplayRow {
  key:         string
  number:      number
  text:        string
  tone:        LogTone
  fastForward: boolean
}

export type LogTextSegmentKind = 'plain' | 'addition' | 'deletion'

export interface LogTextSegment {
  key:  string
  kind: LogTextSegmentKind
  text: string
}


const ESC = String.fromCharCode(27)
const ANSI_ESCAPE_PATTERN = new RegExp(`${ESC}\\[[0-?]*[ -/]*[@-~]`, 'g')

const MOJIBAKE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/âœ“/g, '✓'],
  [/ƒo["“”]/g, '✓'],
  [/â†’/g, '→'],
  [/â€”/g, '—'],
  [/â€“/g, '–'],
  [/â€¢/g, '•'],
  [/â€¦/g, '…'],
  [/ƒ",/g, '│'],
]


export function normalizeLogText(text: string): string {
  return MOJIBAKE_REPLACEMENTS.reduce(
    (next, [pattern, replacement]) => next.replace(pattern, replacement),
    stripControlChars(text.replace(ANSI_ESCAPE_PATTERN, '').replace(/\r/g, '')),
  )
}


function stripControlChars(text: string): string {
  return Array.from(text).filter(char => {
    const code = char.charCodeAt(0)
    return code === 9 || code === 10 || (code >= 32 && code !== 127 && code < 160)
  }).join('')
}


export function toLogDisplayRows(lines: string[]): LogDisplayRow[] {
  let number = 0

  return lines.flatMap((line, lineIndex) => (
    normalizeLogText(line).split('\n').map((text, splitIndex) => {
      number += 1

      return {
        key:         `${lineIndex}-${splitIndex}`,
        number,
        text,
        tone:        getLogTone(text),
        fastForward: hasFastForwardTerm(text),
      }
    })
  ))
}


export function getLogTone(line: string): LogTone {
  const normalized = line.toLowerCase()

  if (/\b(error|failed|failure|fatal|exception|traceback)\b/.test(normalized)) {
    return 'error'
  }

  if (/\b(warn|warning|degraded|retry|skipped)\b/.test(normalized)) {
    return 'warning'
  }

  if (/\b(success|succeeded|complete|completed|done|passed|healthy)\b/.test(normalized)) {
    return 'success'
  }

  if (/\b(info|starting|running|queued|deploying|building|loading)\b/.test(normalized)) {
    return 'info'
  }

  if (line.trim().length === 0 || /^[\s.=-]+$/.test(line)) {
    return 'muted'
  }

  return 'muted'
}


export function hasFastForwardTerm(line: string): boolean {
  return /\bfast[\s-]+forward\b/i.test(line)
}


export function segmentGitDiffMarkers(text: string): LogTextSegment[] {
  const diffstatMarkerStart = getDiffstatMarkerStart(text)
  if (diffstatMarkerStart !== null) {
    return segmentMarkerText(text, /[+-]/g, diffstatMarkerStart)
  }

  return segmentMarkerText(text, /[+-]{2,}/g, 0)
}


function getDiffstatMarkerStart(text: string): number | null {
  const diffstatMatch = /\|\s*\d+\s+[+-]+(?:\s|$)/.exec(text)
  if (!diffstatMatch) return null

  const markerOffset = diffstatMatch[0].search(/[+-]/)
  return markerOffset === -1 ? null : diffstatMatch.index + markerOffset
}


function segmentMarkerText(text: string, markerPattern: RegExp, startIndex: number): LogTextSegment[] {
  const segments: LogTextSegment[] = []
  let cursor = 0
  let match: RegExpExecArray | null
  markerPattern.lastIndex = startIndex

  while ((match = markerPattern.exec(text)) !== null) {
    if (match.index > cursor) {
      segments.push({
        key:  `${cursor}-plain`,
        kind: 'plain',
        text: text.slice(cursor, match.index),
      })
    }

    const markerText = match[0]
    const markerStart = match.index

    Array.from(markerText).forEach((char, offset) => {
      segments.push({
        key:  `${markerStart + offset}-${char}`,
        kind: char === '+' ? 'addition' : 'deletion',
        text: char,
      })
    })

    cursor = markerStart + markerText.length
  }

  if (cursor < text.length) {
    segments.push({
      key:  `${cursor}-plain`,
      kind: 'plain',
      text: text.slice(cursor),
    })
  }

  return segments.length > 0 ? segments : [{ key: '0-plain', kind: 'plain', text }]
}
