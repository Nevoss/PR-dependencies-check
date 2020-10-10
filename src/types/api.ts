export interface PullRequestCheckWebhookResponse {
  number: number
}

export interface PullRequestResponse {
  data: {
    number: number
    body: string
    merged: boolean
    head: {
      sha: string
    }
  }
}
