import { mergeRequestFixture } from '../__fixtures__/mergeRequestFixture';
import { mergeRequestApprovalsFixture } from '../__fixtures__/mergeRequestApprovalsFixture';
import { mergeRequestDetailsFixture } from '../__fixtures__/mergeRequestDetailsFixture';
import { mergeRequestParticipantsFixture } from '../__fixtures__/mergeRequestParticipantsFixture';
import { projectFixture } from '../__fixtures__/projectFixture';
import { mockGitlabCall } from './mockGitlabCall';

export function mockBuildReviewMessageCalls() {
  const { iid, project_id } = mergeRequestFixture;

  mockGitlabCall(
    `/projects/${project_id}/merge_requests/${iid}/approvals`,
    mergeRequestApprovalsFixture
  );
  mockGitlabCall(
    `/projects/${project_id}/merge_requests/${iid}`,
    mergeRequestDetailsFixture
  );
  mockGitlabCall(
    `/projects/${project_id}/merge_requests/${iid}/participants`,
    mergeRequestParticipantsFixture
  );
  mockGitlabCall(`/projects/${project_id}`, projectFixture);
}
