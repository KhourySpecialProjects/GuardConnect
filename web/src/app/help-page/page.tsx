import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChannelShell } from "../communications/components";

export default function HelpPage() {
  return (
    <ChannelShell
      title={
        <div className="flex flex-col gap-4">
          <div className="space-y-3">
            <h1 className="text-[1.75rem] font-semibold leading-tight text-secondary sm:text-[2.25rem]">
              Help Center
            </h1>
            <p className="max-w-2xl text-body text-secondary/70">
              Everything you need to get started: learn how to browse channels,
              send messages, apply for mentorship, and make the most of your
              experience.
            </p>
          </div>
        </div>
      }
    >
      <Tabs defaultValue="communications" className="w-full">
        <TabsList className="gap-2 bg-transparent p-0">
          <TabsTrigger
            value="communications"
            className="data-[state=active]:bg-primary data-[state=active]:text-background data-[state=active]:shadow-md data-[state=inactive]:bg-transparent data-[state=inactive]:text-secondary/70"
          >
            Communications
          </TabsTrigger>
          <TabsTrigger
            value="mentorship"
            className="data-[state=active]:bg-primary data-[state=active]:text-background data-[state=active]:shadow-md data-[state=inactive]:bg-transparent data-[state=inactive]:text-secondary/70"
          >
            Mentorship
          </TabsTrigger>
        </TabsList>

        <TabsContent value="communications" className="mt-6">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1>comms</h1>
          </section>
        </TabsContent>

        <TabsContent value="mentorship" className="mt-6">
          <section className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <h1>mentorship</h1>
          </section>
        </TabsContent>
      </Tabs>
    </ChannelShell>
  );
}
