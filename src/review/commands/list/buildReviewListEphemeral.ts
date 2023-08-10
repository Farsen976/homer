import type { ChatPostEphemeralArguments } from '@slack/web-api';
import slackifyMarkdown from 'slackify-markdown';
import { MERGE_REQUEST_OPEN_STATES } from '@/constants';
import { fetchMergeRequestByIid } from '@/core/services/gitlab';
import { getPermalink } from '@/core/services/slack';
import type { DataReview } from '@/core/typings/Data';

interface BuildReviewListEphemeralData {
  channelId: string;
  reviews: DataReview[];
  userId: string;
}

export async function buildReviewListEphemeral({
  channelId,
  reviews,
  userId,
}: BuildReviewListEphemeralData): Promise<ChatPostEphemeralArguments> {
  const mergeRequests = await Promise.all(
    reviews.map(({ projectId, mergeRequestIid }) =>
      fetchMergeRequestByIid(projectId, mergeRequestIid)
    )
  );

  const openedMergeRequests = mergeRequests.filter(({ state }) =>
    MERGE_REQUEST_OPEN_STATES.includes(state)
  );

  const links = new Map<number, string>();

  await Promise.all(
    reviews
      .filter(({ mergeRequestIid }) =>
        openedMergeRequests.some(({ iid }) => iid === mergeRequestIid)
      )
      .map(async ({ mergeRequestIid, ts }) => {
        links.set(mergeRequestIid, await getPermalink(channelId, ts));
      })
  );

  const formattedReviews = openedMergeRequests
    .map(({ iid, title }) => `- [${title}](${links.get(iid)})`)
    .sort()
    .join('\n');

  const formattedReviewsFallback = openedMergeRequests
    .map(({ title }) => title)
    .join(', ');

  return {
    channel: channelId,
    user: userId,
    text:
      openedMergeRequests.length > 0
        ? `Ongoing reviews: ${formattedReviewsFallback}.`
        : 'There is no ongoing review shared in this channel.',
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text:
            openedMergeRequests.length > 0
              ? slackifyMarkdown(`**Ongoing reviews:**\n${formattedReviews}`)
              : 'There is no ongoing review shared in this channel :homer-metal:',
        },
      },
    ],
  };
}
