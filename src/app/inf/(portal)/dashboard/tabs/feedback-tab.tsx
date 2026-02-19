"use client";

import { FeedbackPanel } from "@/components/feedback/feedback-panel";

type Props = {
  influencerId: string;
};

export function FeedbackTab({ influencerId }: Props) {
  return (
    <FeedbackPanel
      role="influencer"
      userId={influencerId}
      title="Feedback de influencers"
      subtitle="Comparte ideas y mejoras para el portal."
    />
  );
}
