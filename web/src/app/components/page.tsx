"use client";
import { useEffect, useState } from "react";
import { SelectableButton } from "@/components/buttons";
import { icons } from "@/components/icons";
import LinkedCard from "@/components/linked-card";
import ListView from "@/components/list-view";
import Navigation from "@/components/navigation";

const Components = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const MenuIcon = icons.menu;

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  return (
    <>
      <Navigation
        mobileOpen={mobileNavOpen}
        onMobileClose={() => setMobileNavOpen(false)}
      />
      <main className="relative min-h-screen bg-background px-4 pb-16 pt-16 sm:px-6 lg:pl-[30rem] lg:pr-10 lg:py-12">
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center text-primary transition-colors hover:text-primary-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 lg:hidden"
          aria-label="Open navigation"
        >
          <MenuIcon className="h-7 w-7" />
        </button>

        <header className="mb-8 flex items-center justify-between">
          <div className="w-full flex flex-col items-start gap-3">
            <div>
              <h1 className="text-header font-semibold text-secondary">
                Component Library
              </h1>
              <p className="text-sm text-secondary/70">
                Responsive shells and interaction samples
              </p>
            </div>
            <div className="w-full flex flex-col gap-2">
              <LinkedCard
                href="https://example.com"
                content="How to Mentor Effectively: 5 Tips for Success"
              />
            </div>
      <main className="min-h-screen bg-background px-4 pb-16 pt-20 sm:px-6 lg:pl-[21rem] lg:pr-12 lg:pt-16">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-10">
          <div className="flex justify-start lg:hidden">
            <button
              type="button"
              onClick={() => setMobileNavOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-transparent px-3 py-2 text-primary transition hover:text-primary focus-visible:outline-none"
              aria-label="Open navigation"
            >
              <MenuIcon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <header className="space-y-2">
            <p className="text-sm uppercase tracking-[0.25em] text-primary">
              Components Gallery
            </p>
            <h1 className="text-header font-semibold text-secondary">
              Communication UI Patterns
            </h1>
          </header>

          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-subheader font-semibold text-secondary">
                Button Component
              </h2>
            </div>
            <SelectableButton text="Button" />
          </section>

          <section className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-subheader font-semibold text-secondary">
                Member List View
              </h2>
            </div>
            <ListView />
          </section>
        </div>
      </main>
    </>
  );
};

export default Components;
