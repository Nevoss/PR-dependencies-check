import { Context } from 'probot'
import PullRequestBody from './pull-request-body'
import PullRequestCheck from './pull-request-check'

interface PullRequestData {
  number: number
  owner_name: string
  repo_name: string
  head_sha?: string
  body?: string
  isMerged?: boolean
}

export default class PullRequest {
  /**
   * Hold the necessary data of the pull request
   */
  public data: PullRequestData

  /**
   * Service to communicate github api
   *
   * @protected
   */
  protected api: Context['github']

  protected body: PullRequestBody

  protected check: PullRequestCheck

  /**
   * Pull Request constructor
   *
   * @param data
   * @param api
   */
  constructor(data: PullRequestData, api: Context['github']) {
    this.data = { ...data, isMerged: false }
    this.api = api
    this.body = new PullRequestBody(this.data.body)
    this.check = new PullRequestCheck(this.api, this)
  }

  public async createDependenciesCheck() {
    if (!this.data.owner_name || !this.data.repo_name) {
      throw new Error(
        'Pull requests must have owner_name and repo_name for "createDependenciesCheck"'
      )
    }

    await this.check.start()

    const dependencies = this.body.extractPullRequestSignatures().map(
      (pullRequestSignature) =>
        new PullRequest(
          {
            ...pullRequestSignature,
            owner_name: pullRequestSignature.owner_name || this.data.owner_name,
            repo_name: pullRequestSignature.repo_name || this.data.repo_name,
          },
          this.api
        )
    )

    await Promise.all(
      dependencies.map((dependency) => dependency.ensureIsMerged())
    )

    const unMergedDependencies = dependencies.filter(
      (dependency) => !dependency.data.isMerged
    )

    return unMergedDependencies.length
      ? this.check.markAsFailed(unMergedDependencies)
      : this.check.markAsSuccess()
  }

  /**
   * Ensure that the pull request is merged or not.
   */
  public async ensureIsMerged(): Promise<boolean> {
    try {
      await this.api.pulls.checkIfMerged({
        owner: this.data.owner_name,
        repo: this.data.repo_name,
        pull_number: this.data.number,
      })

      this.data.isMerged = true
    } catch (e) {
      this.data.isMerged = false
    }

    return this.data.isMerged
  }

  /**
   * Check if the 2 pull requests belongs to the same repository
   *
   * @param pullRequest
   */
  public shareSameRepoWith(pullRequest: PullRequest) {
    return (
      this.data.repo_name === pullRequest.data.repo_name &&
      this.data.owner_name === pullRequest.data.owner_name
    )
  }

  /**
   * Return the pull request path.
   *
   * @param fullPath
   */
  public toString(fullPath = true) {
    const prefix = `${this.data.owner_name}/${this.data.repo_name}`

    return `${fullPath ? prefix : ''}#${this.data.number}`
  }
}
