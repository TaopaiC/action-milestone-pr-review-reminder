import * as core from '@actions/core'
import { getOctokit } from '@actions/github'
import getRepoPropertyByName from './utils/getRepoPropertyByName.js'
import getPRByMilestone from './utils/getPRByMilestone.js'
import buildReport from './utils/buildReport.js'
import sendToSlack from './utils/sendToSlack.js'
import getMilestoneByQuery from './utils/getMilestoneByQuery.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const GITHUB_TOKEN: string = core.getInput('token', { required: true })
    const REPO = process.env.GITHUB_REPOSITORY
    if (!REPO) {
      throw new Error(
        'The GITHUB_REPOSITORY environment variable is not defined. Ensure this script is running in a GitHub Actions environment or set the variable manually.'
      )
    }
    const MILESTONE_PROPERTY_NAME: string = core.getInput(
      'milestone_property_name',
      { required: true }
    )
    const MILESTONE: string = core.getInput('milestone')
    const SLACK_WEBHOOK_URL: string = core.getInput('slack_webhook_url')
    const MIN_APPROVED_REVIEWS: number = parseInt(
      core.getInput('min_approved_reviews') || '1',
      10
    )
    const [owner, repo] = REPO.split('/')

    const octokit = getOctokit(GITHUB_TOKEN)
    const milestoneTitles =
      MILESTONE !== ''
        ? [MILESTONE]
        : await getRepoPropertyByName(
            octokit,
            owner,
            repo,
            MILESTONE_PROPERTY_NAME
          )

    if (!milestoneTitles) {
      core.info('No current milestone set.')
      return
    }

    const milestonePromises = milestoneTitles.map(async (milestoneTitle) => {
      const milestone = await getMilestoneByQuery(
        octokit,
        owner,
        repo,
        milestoneTitle
      )

      if (core.isDebug()) {
        core.debug('getMilestoneByQuery: ' + JSON.stringify(milestone, null, 2))
      }

      if (!milestone) {
        core.info(`Milestone "${milestoneTitle}" not found.`)
        return
      }

      const result = await getPRByMilestone(
        octokit,
        owner,
        repo,
        milestone.number,
        ['APPROVED', 'CHANGES_REQUESTED', 'COMMENTED']
      )

      if (core.isDebug()) {
        core.debug('getPRByMilestone: ' + JSON.stringify(result, null, 2))
      }

      const report = buildReport(result, MIN_APPROVED_REVIEWS)

      if (core.isDebug()) {
        core.debug('Report: ' + JSON.stringify(report, null, 2))
      }

      core.setOutput('reminder_message', report)

      if (SLACK_WEBHOOK_URL !== '') {
        await sendToSlack(report, SLACK_WEBHOOK_URL)
      }
    })
    await Promise.all(milestonePromises)
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
