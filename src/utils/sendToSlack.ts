import { HttpClient } from '@actions/http-client'

async function sendToSlack(text: string, slackWebhookUrl: string) {
  const httpClient = new HttpClient('milestone-pr-review-reminder')
  await httpClient.postJson(slackWebhookUrl, { text })
}

export type SendToSlack = typeof sendToSlack

export default sendToSlack
