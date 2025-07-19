/* eslint-disable @typescript-eslint/no-explicit-any */
import buildReport from '../buildReport.js'

describe('buildReport', () => {
  it('returns default message when no PRs pending review', () => {
    expect(buildReport([])).toBe(
      ':tada: There are currently no PRs pending review!'
    )
  })

  it('generates report for multiple PRs with reviewers', () => {
    const prs = [
      {
        number: 1,
        title: 'Fix bug',
        html_url: 'https://github.com/org/repo/pull/1',
        user: { login: 'alice' },
        requested_reviewers: [{ login: 'bob' }, { login: 'carol' }]
      },
      {
        number: 2,
        title: 'Add feature',
        html_url: 'https://github.com/org/repo/pull/2',
        user: { login: 'dave' },
        requested_reviewers: []
      }
    ]
    const text = buildReport(prs as any)
    expect(text).toContain(
      '[#1] <https://github.com/org/repo/pull/1|Fix bug> (alice)'
    )
    expect(text).toContain('Waiting on bob, carol')
    expect(text).toContain(
      '[#2] <https://github.com/org/repo/pull/2|Add feature> (dave)'
    )
  })

  it('handles undefined requested_reviewers field without showing reviewers', () => {
    const prs = [
      {
        number: 3,
        title: 'Refactor code',
        html_url: 'https://github.com/org/repo/pull/3',
        user: { login: 'eve' }
        // requested_reviewers 為 undefined
      }
    ]
    const text = buildReport(prs as any)
    expect(text).not.toContain('Waiting on')
    expect(text).toContain(
      '[#3] <https://github.com/org/repo/pull/3|Refactor code> (eve)'
    )
  })
})
