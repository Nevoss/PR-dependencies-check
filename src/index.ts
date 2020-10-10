import { Application } from 'probot'
import pullRequestEvent from './pull-request-event'
import requestedActionEvent from './requested-action-event'

const eventHandlersDeclarations = [
  {
    event: [
      'pull_request.opened',
      'pull_request.edited',
      'pull_request.reopened',
    ],
    handler: pullRequestEvent,
  },
  {
    event: 'check_run.requested_action',
    handler: requestedActionEvent,
  },
]

export = (app: Application): void => {
  eventHandlersDeclarations.forEach((eventAndHandler) =>
    // @ts-ignore
    app.on(eventAndHandler.event, eventAndHandler.handler)
  )
}
