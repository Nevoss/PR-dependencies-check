import { Context } from 'probot'
import PullRequest from './pull-request'
import { checkStatus, checkConclusion } from '../types/check'

export default class PullRequestCheck {
  public static actionIdentifier = 'pr-dep-check'

  public static checkName = 'Dependencies PRs Check'

  /**
   * Api to github.
   *
   * @protected
   */
  protected api: Context['github']

  /**
   * The pull request that the check related to.
   *
   * @protected
   */
  protected pullRequest: PullRequest

  constructor(api: Context['github'], pullRequest: PullRequest) {
    this.api = api
    this.pullRequest = pullRequest
  }

  public start(): Promise<any> {
    return this.send({ status: checkStatus.inProgress })
  }

  public markAsFailed(unMergedDependencies: PullRequest[]): Promise<any> {
    const blockedBy = unMergedDependencies
      .map((unMergedDependency: PullRequest) =>
        unMergedDependency.toString(
          !this.pullRequest.shareSameRepoWith(unMergedDependency)
        )
      )
      .join(',')

    return this.send({
      completed_at: new Date().toISOString(),
      status: checkStatus.completed,
      conclusion: checkConclusion.failure,
      output: {
        title: `PR Dependencies are not merged yet.`,
        summary:
          'To make the this check passes, it required to merge the dependencies pull requests or remove them from the dependencies declaration. \n\n' +
          `**Blocked by: ${blockedBy}**`,
      },
      actions: [
        {
          label: 'Re-Check',
          description: 'Runs dependencies check again.',
          identifier: PullRequestCheck.actionIdentifier,
        },
      ],
    })
  }

  public markAsSuccess(): Promise<any> {
    return this.send({
      completed_at: new Date().toISOString(),
      status: checkStatus.completed,
      conclusion: checkConclusion.success,
    })
  }

  protected send(args: object): Promise<any> {
    if (!this.pullRequest.data.head_sha) {
      throw new Error('Pull request must have head sha.')
    }

    return this.api.checks.create({
      name: PullRequestCheck.checkName,
      owner: this.pullRequest.data.owner_name,
      repo: this.pullRequest.data.repo_name,
      head_sha: this.pullRequest.data.head_sha,
      ...args,
    })
  }
}
