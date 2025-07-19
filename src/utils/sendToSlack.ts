import { HttpClient } from '@actions/http-client'

async function sendToSlack(text: string, slackWebhookUrl: string) {
  const httpClient = new HttpClient('milestone-pr-review-reminder')
  try {
    await httpClient.postJson(slackWebhookUrl, { text })
  } catch (error) {
    throw new Error(`Failed to send message to Slack: ${error.message || error}`)
  }
}

export type SendToSlack = typeof sendToSlack

export default sendToSlack
