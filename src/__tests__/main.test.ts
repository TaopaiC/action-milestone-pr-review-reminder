/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Unit tests for src/main.ts
 */
import { jest } from '@jest/globals'
import type { GetRepoPropertyByName } from '../utils/getRepoPropertyByName.js'
import type { GetPRByMilestone } from '../utils/getPRByMilestone.js'
import type { BuildReport } from '../utils/buildReport.js'
import type { SendToSlack } from '../utils/sendToSlack.js'
import type { GetMilestoneByQuery } from '../utils/getMilestoneByQuery.js'

const getOctokit = jest.fn()
const getRepoPropertyByName = jest.fn<GetRepoPropertyByName>()
const getPRByMilestone = jest.fn<GetPRByMilestone>()
const getMilestoneByQuery = jest.fn<GetMilestoneByQuery>()
const buildReport = jest.fn<BuildReport>()
const sendToSlack = jest.fn<SendToSlack>()
import * as core from '../../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/github', () => ({ getOctokit }))
jest.unstable_mockModule('../utils/getRepoPropertyByName.js', () => ({
  default: getRepoPropertyByName
}))
jest.unstable_mockModule('../utils/getPRByMilestone.js', () => ({
  default: getPRByMilestone
}))
jest.unstable_mockModule('../utils/getMilestoneByQuery.js', () => ({
  default: getMilestoneByQuery
}))
jest.unstable_mockModule('../utils/buildReport.js', () => ({
  default: buildReport
}))
jest.unstable_mockModule('../utils/sendToSlack.js', () => ({
  default: sendToSlack
}))

const { run } = await import('../main.js')

describe('main.ts', () => {
  const owner = 'octocat'
  const repo = 'hello-world'
  const repoFull = `${owner}/${repo}`

  beforeEach(() => {
    process.env.GITHUB_REPOSITORY = repoFull
    core.getInput.mockReset()
    core.setOutput.mockReset()
    core.setFailed.mockReset()
    getOctokit.mockReset()
    getRepoPropertyByName.mockReset()
    getPRByMilestone.mockReset()
    buildReport.mockReset()
    sendToSlack.mockReset()
  })

  it('main flow: get milestone, generate report and send to Slack', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'token':
          return 'token123'
        case 'milestone_property_name':
          return 'milestone'
        case 'milestone':
          return ''
        case 'slack_webhook_url':
          return 'https://slack'
        case 'min_approved_reviews':
          return '2'
        default:
          return ''
      }
    })
    getOctokit.mockReturnValue('octokit')
    getRepoPropertyByName.mockResolvedValue(['v1.0'])
    getMilestoneByQuery.mockResolvedValue({
      number: 2,
      title: 'v1.0',
      url: 'https://example.com/milestone/2',
      state: 'OPEN'
    })
    getPRByMilestone.mockResolvedValue('RESULT' as any)
    buildReport.mockReturnValue('report text')
    sendToSlack.mockResolvedValue(undefined)

    await run()

    expect(getOctokit).toHaveBeenCalledWith('token123')
    expect(getRepoPropertyByName).toHaveBeenCalledWith(
      'octokit',
      owner,
      repo,
      'milestone'
    )
    expect(getMilestoneByQuery).toHaveBeenCalledWith(
      'octokit',
      owner,
      repo,
      'v1.0'
    )
    expect(getPRByMilestone).toHaveBeenCalledWith('octokit', owner, repo, 2, [
      'APPROVED',
      'CHANGES_REQUESTED',
      'COMMENTED'
    ])
    expect(buildReport).toHaveBeenCalledWith('RESULT', 2)
    expect(core.setOutput).toHaveBeenCalledWith(
      'reminder_message',
      'report text'
    )
    expect(sendToSlack).toHaveBeenCalledWith('report text', 'https://slack')
  })

  it('does not call getRepoPropertyByName when MILESTONE has value', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'token':
          return 'token123'
        case 'milestone_property_name':
          return 'milestone'
        case 'milestone':
          return 'v1.0'
        case 'slack_webhook_url':
          return 'https://slack'
        case 'min_approved_reviews':
          return '2'
        default:
          return ''
      }
    })
    getOctokit.mockReturnValue('octokit')
    getMilestoneByQuery.mockResolvedValue({
      number: 2,
      title: 'v1.0',
      url: 'https://example.com/milestone/2',
      state: 'OPEN'
    })
    getPRByMilestone.mockResolvedValue('RESULT' as any)
    buildReport.mockReturnValue('report text')
    sendToSlack.mockResolvedValue(undefined)

    await run()

    expect(getOctokit).toHaveBeenCalledWith('token123')
    expect(getRepoPropertyByName).not.toHaveBeenCalled()
    expect(getMilestoneByQuery).toHaveBeenCalledWith(
      'octokit',
      owner,
      repo,
      'v1.0'
    )
    expect(getPRByMilestone).toHaveBeenCalledWith('octokit', owner, repo, 2, [
      'APPROVED',
      'CHANGES_REQUESTED',
      'COMMENTED'
    ])
    expect(buildReport).toHaveBeenCalledWith('RESULT', 2)
    expect(core.setOutput).toHaveBeenCalledWith(
      'reminder_message',
      'report text'
    )
    expect(sendToSlack).toHaveBeenCalledWith('report text', 'https://slack')
  })

  it('should end process when milestones is null', async () => {
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'token':
          return 'token123'
        case 'milestone_property_name':
          return 'milestone'
        case 'milestone':
          return ''
        case 'slack_webhook_url':
          return ''
        case 'min_approved_reviews':
          return '1'
        default:
          return ''
      }
    })
    getOctokit.mockReturnValue('octokit')
    getRepoPropertyByName.mockResolvedValue(null)
    getMilestoneByQuery.mockResolvedValue({
      number: 2,
      title: 'v1.0',
      url: 'https://example.com/milestone/2',
      state: 'OPEN'
    })
    getPRByMilestone.mockResolvedValue('RESULT' as any)
    buildReport.mockReturnValue('report text')
    sendToSlack.mockResolvedValue(undefined)

    await run()

    expect(getPRByMilestone).not.toHaveBeenCalled()
    expect(core.setOutput).not.toHaveBeenCalled()
    expect(sendToSlack).not.toHaveBeenCalled()
    expect(core.info).toHaveBeenCalledWith('No current milestone set.')
  })

  it('calls setFailed when exception occurs', async () => {
    core.getInput.mockImplementation(() => {
      throw new Error('input error')
    })
    await run()
    expect(core.setFailed).toHaveBeenCalledWith('input error')
  })
})
