'use client'

import { useState } from 'react'
import { MessageSquare, ChevronDown } from 'lucide-react'
import { getScoreColor, formatScore } from '@/lib/dataTransform'

const PAGE_SIZE = 10

/**
 * Scrollable comments feed with pagination.
 */
export default function CommentsFeed({ responses, showAuthor = true, title = 'Comments', commentField = 'comment', scoreField = 'weekScore' }) {
  const [page, setPage] = useState(1)

  const withComments = responses
    .filter(r => r[commentField]?.trim().length > 0)
    .sort((a, b) => b.weekKey.localeCompare(a.weekKey))

  const visible = withComments.slice(0, page * PAGE_SIZE)
  const hasMore = visible.length < withComments.length

  if (withComments.length === 0) {
    return (
      <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6 card-highlight">
        <SectionHeader title={title} count={0} />
        <div className="flex flex-col items-center justify-center py-10 text-gecko-subtext">
          <MessageSquare size={26} className="mb-3 opacity-25" />
          <p className="text-sm">No comments yet this period</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gecko-card border border-gecko-border rounded-2xl p-6 card-highlight">
      <SectionHeader title={title} count={withComments.length} />

      <div className="space-y-1 mt-4 stagger">
        {visible.map((r, i) => (
          <CommentItem key={`${r.id}-${i}`} response={r} showAuthor={showAuthor} commentField={commentField} scoreField={scoreField} />
        ))}
      </div>

      {hasMore && (
        <button
          onClick={() => setPage(p => p + 1)}
          className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 text-xs text-gecko-muted hover:text-white border border-gecko-border hover:border-gecko-muted rounded-xl transition-colors"
        >
          <ChevronDown size={13} />
          Show {Math.min(PAGE_SIZE, withComments.length - visible.length)} more
        </button>
      )}
    </div>
  )
}

function CommentItem({ response, showAuthor, commentField = 'comment', scoreField = 'weekScore' }) {
  const score = response[scoreField]
  const scoreColor = getScoreColor(score)

  return (
    <div className="flex gap-3 p-3 rounded-xl hover:bg-gecko-card-hover transition-colors group">
      {/* Score bar */}
      <div
        className="w-[3px] flex-shrink-0 rounded-full mt-1"
        style={{ backgroundColor: scoreColor, minHeight: '36px', opacity: 0.7 }}
      />

      <div className="flex-1 min-w-0">
        {/* Comment text */}
        <p className="text-sm text-white/85 leading-relaxed">
          &ldquo;{response[commentField]}&rdquo;
        </p>

        {/* Meta row */}
        <div className="flex items-center gap-2.5 mt-2 flex-wrap">
          {showAuthor && response.name && (
            <span className="text-xs font-medium text-gecko-muted">{response.name}</span>
          )}
          {response.department && (
            <span className="text-xs text-gecko-subtext">{response.department}</span>
          )}
          <span className="text-xs text-gecko-subtext">{response.weekLabel}</span>
          <span
            className="text-xs font-display font-semibold px-1.5 py-0.5 rounded"
            style={{ color: scoreColor, backgroundColor: `${scoreColor}14` }}
          >
            {formatScore(score)}
          </span>
        </div>
      </div>
    </div>
  )
}

function SectionHeader({ title, count }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <MessageSquare size={14} className="text-gecko-muted" />
        <h3 className="text-sm font-semibold text-white">{title}</h3>
      </div>
      {count > 0 && (
        <span className="text-[11px] text-gecko-subtext bg-gecko-dark border border-gecko-border rounded-full px-2.5 py-0.5 font-display">
          {count}
        </span>
      )}
    </div>
  )
}
