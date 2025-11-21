"use client";

import { Button } from "@/components/ui/button";
import { Modal, type ModalProps } from "./index";

export type DeleteChannelModalProps = Omit<
  ModalProps,
  "title" | "description" | "children" | "footer"
> & {
  onLeave: () => void | Promise<void>;
  isLeaving?: boolean;
};

export function DeleteChannelModal({
  open,
  onOpenChange,
  onLeave,
  isLeaving = false,
}: DeleteChannelModalProps) {
  const handleLeave = async () => {
    await onLeave();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Are you sure you want to delete this channel?"
      description="This action cannot be undone. All users will be removed from this channel."
      footer={
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isLeaving}
          >
            No, Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleLeave}
            disabled={isLeaving}
          >
            {isLeaving ? "Deleting..." : "Yes, Delete"}
          </Button>
        </div>
      }
    />
  );
}
