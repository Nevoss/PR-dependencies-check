import PullRequest from './core/pull-request'
import { Context } from 'probot'

export default async (context: Context) => {
  const {
    payload: { pull_request, repository },
    github,
  } = context

  const pullRequest = new PullRequest(
    {
      repo_name: repository.name,
      owner_name: repository.owner.login,
      number: pull_request.number,
      body: pull_request.body,
      head_sha: pull_request.head.sha,
      isMerged: pull_request.merged,
    },
    github
  )

  await pullRequest.createDependenciesCheck()
}
