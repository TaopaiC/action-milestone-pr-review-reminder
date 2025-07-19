/* eslint-disable @typescript-eslint/no-explicit-any */
import buildReport from '../buildReport.js'

describe('buildReport', () => {
  it('無待審查 PR 時回傳預設訊息', () => {
    expect(buildReport([])).toBe(
      ':tada: There are currently no PRs pending review!'
    )
  })

  it('有多個 PR 並正確顯示 reviewer', () => {
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

  it('requested_reviewers 欄位為 undefined 時不顯示 reviewer', () => {
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
