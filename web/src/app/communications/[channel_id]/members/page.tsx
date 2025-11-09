import { TitleShell } from "@/components/layouts/title-shell";

type ChannelMembersPageProps = {
  params: {
    channel_id: string;
  };
};

export default function ChannelMembersPage({
  params,
}: ChannelMembersPageProps) {
  const channelId = params.channel_id;

  return (
    <TitleShell
      title="Channel Members"
      backHref={`/communications/${channelId}/settings`}
      backAriaLabel="Back to settings"
    >
      <section className="rounded-2xl border border-dashed border-primary/30 bg-card p-8 text-secondary/70">
        <p>Channel members will appear here.</p>
      </section>
    </TitleShell>
  );
}
