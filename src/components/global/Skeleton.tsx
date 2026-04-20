/**
 * Skeleton primitives.
 *
 * Thin shimmering blocks used while data loads. Prefer over a central
 * <LoadingSpinner> for list/table shapes — a skeleton row that matches
 * the eventual layout feels calmer than a page-wide spinner that
 * flashes on every refetch.
 */
import type { CSSProperties } from 'react'


interface SkeletonProps {
  width?:   number | string
  height?:  number
  style?:   CSSProperties
}


export function SkeletonBar({ width = '100%', height = 10, style }: SkeletonProps) {
  return (
    <span
      className="skeleton-bar"
      style={{ width, height, ...style }}
    />
  )
}


export function SkeletonBlock({ width = '100%', height = 48, style }: SkeletonProps) {
  return (
    <div
      className="skeleton-block"
      style={{ width, height, ...style }}
    />
  )
}


interface ProjectRowSkeletonProps {
  rows?: number
}


export function ProjectRowSkeleton({ rows = 5 }: ProjectRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="project-row project-row-skeleton">
          <span className="skeleton-bar skeleton-dot" />
          <div className="project-row-body">
            <SkeletonBar width="60%" height={11} />
            <SkeletonBar width="40%" height={9} style={{ marginTop: 6 }} />
          </div>
          <SkeletonBar width={28} height={9} />
        </div>
      ))}
    </>
  )
}


interface TableRowSkeletonProps {
  rows?:    number
  columns:  number
}


export function TableRowSkeleton({ rows = 6, columns }: TableRowSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="skeleton-tr">
          {Array.from({ length: columns }).map((__, j) => (
            <td key={j}><SkeletonBar width={j === 0 ? '70%' : '50%'} /></td>
          ))}
        </tr>
      ))}
    </>
  )
}
