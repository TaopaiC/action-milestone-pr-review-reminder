import { HttpClient } from '@actions/http-client'

/**
 * Sends a message to a Slack channel using the provided webhook URL.
 *
 * @param {string} text - The message text to send to Slack.
 * @param {string} slackWebhookUrl - The Slack webhook URL to send the message to.
 * @returns {Promise<void>} A promise that resolves when the message is successfully sent.
 * @throws {Error} Throws an error if the message fails to send.
 */
async function sendToSlack(text: string, slackWebhookUrl: string) {
  const httpClient = new HttpClient('milestone-pr-review-reminder')
  try {
    await httpClient.postJson(slackWebhookUrl, { text })
  } catch (error: unknown) {
    const errorMessage =
      error && typeof error === 'object' && 'message' in error
        ? (error as { message: string }).message
        : String(error)
    throw new Error(`Failed to send message to Slack: ${errorMessage}`)
  }
}

export type SendToSlack = typeof sendToSlack

export default sendToSlack
