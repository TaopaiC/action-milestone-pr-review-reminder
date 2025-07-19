import { jest } from '@jest/globals'
import type { HttpClient } from '@actions/http-client'
import { TypedResponse } from '@actions/http-client/lib/interfaces.js'

const postJsonMock = jest.fn<HttpClient['postJson']>()
class HttpClientMock {
  constructor() {}
  postJson = postJsonMock
}

jest.unstable_mockModule('@actions/http-client', () => ({
  HttpClient: HttpClientMock
}))

const { default: sendToSlack } = await import('../sendToSlack.js')

describe('sendToSlack', () => {
  const webhookUrl = 'https://hooks.slack.com/services/xxx/yyy/zzz'
  const message = 'Hello, Slack!'

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('successfully sends message to Slack', async () => {
    postJsonMock.mockResolvedValueOnce({
      statusCode: 200
    } as TypedResponse<unknown>)

    await expect(sendToSlack(message, webhookUrl)).resolves.toBeUndefined()
    expect(postJsonMock).toHaveBeenCalledWith(webhookUrl, { text: message })
  })

  it('handles postJson throwing exception', async () => {
    postJsonMock.mockRejectedValueOnce(new Error('Network error'))

    await expect(sendToSlack(message, webhookUrl)).rejects.toThrow(
      'Network error'
    )
    expect(postJsonMock).toHaveBeenCalledWith(webhookUrl, { text: message })
  })
})
