import { HttpClient } from '@actions/http-client'

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
