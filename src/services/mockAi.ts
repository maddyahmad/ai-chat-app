import { CANNED_REPLIES } from "../utils/constants";

export async function getCannedReply() {
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    reply:
      CANNED_REPLIES[
        Math.floor(Math.random() * CANNED_REPLIES.length)
      ],
  };
}