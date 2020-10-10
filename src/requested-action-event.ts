import { Context } from 'probot'
import PullRequest from './core/pull-request'
import {
  PullRequestCheckWebhookResponse,
  PullRequestResponse,
} from './types/api'
import PullRequestCheck from './core/pull-request-check'

export default async (context: Context) => {
  const {
    payload: {
      repository,
      check_run: { pull_requests },
      requested_action: { identifier },
    },
    github,
  } = context

  if (identifier !== PullRequestCheck.actionIdentifier) {
    return
  }

  const pullRequestsResponse = await Promise.all(
    pull_requests.map((pullRequest: PullRequestCheckWebhookResponse) =>
      github.pulls.get({
        owner: repository.owner.login,
        repo: repository.name,
        pull_number: pullRequest.number,
      })
    )
  )

  await Promise.all(
    // @ts-ignore
    pullRequestsResponse.map((pullRequestResponse: PullRequestResponse) => {
      const pullRequest = new PullRequest(
        {
          repo_name: repository.name,
          owner_name: repository.owner.login,
          number: pullRequestResponse.data.number,
          body: pullRequestResponse.data.body,
          head_sha: pullRequestResponse.data.head.sha,
          isMerged: pullRequestResponse.data.merged,
        },
        github
      )

      return pullRequest.createDependenciesCheck()
    })
  )
}
