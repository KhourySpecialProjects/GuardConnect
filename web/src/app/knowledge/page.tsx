"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { TRPCClientError } from "@trpc/client";
import { ChevronRight, FileText, Folder, FolderOpen, Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TitleShell } from "@/components/layouts/title-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTRPCClient } from "@/lib/trpc";
import { cn } from "@/lib/utils";

type FolderRecord = {
  folderId: string;
  parentFolderId: string | null;
  title: string;
  updatedAt: string;
};

type ItemRecord = {
  itemId: string;
  name: string;
  description: string | null;
  body: string | null;
  updatedAt: string;
};

type FolderLookup = Record<
  string,
  { folderId: string; parentFolderId: string | null; title: string }
>;

type Row =
  | {
      kind: "folder";
      id: string;
      name: string;
      updatedAt: string;
      raw: FolderRecord;
    }
  | {
      kind: "item";
      id: string;
      name: string;
      updatedAt: string;
      raw: ItemRecord;
    };

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleString();
};

const toErrorMessage = (error: unknown) => {
  if (error instanceof TRPCClientError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
};

export default function KnowledgePage() {
  const trpcClient = useTRPCClient();
  const queryClient = useQueryClient();

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderLookup, setFolderLookup] = useState<FolderLookup>({});
  const [selectedRow, setSelectedRow] = useState<{
    kind: Row["kind"];
    id: string;
  } | null>(null);
  const [search, setSearch] = useState("");
  const [showCreateItemForm, setShowCreateItemForm] = useState(false);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemBody, setNewItemBody] = useState("");
  const [newItemAttachment, setNewItemAttachment] = useState<File | null>(null);
  const [newItemAttachmentInputKey, setNewItemAttachmentInputKey] = useState(0);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const rootFoldersQuery = useQuery({
    queryKey: ["knowledge", "folders", "root"],
    queryFn: () =>
      trpcClient.knowledge.getRootFolders.query() as Promise<FolderRecord[]>,
  });

  const childFoldersQuery = useQuery({
    queryKey: ["knowledge", "folders", "child", currentFolderId],
    enabled: Boolean(currentFolderId),
    queryFn: () =>
      trpcClient.knowledge.getFoldersInFolder.query({
        parentFolderId: currentFolderId ?? "",
      }) as Promise<FolderRecord[]>,
  });

  const itemsQuery = useQuery({
    queryKey: ["knowledge", "items", currentFolderId],
    enabled: Boolean(currentFolderId),
    queryFn: () =>
      trpcClient.knowledge.getItemsInFolder.query({
        folderId: currentFolderId ?? "",
      }) as Promise<ItemRecord[]>,
  });

  const registerFolders = useCallback((folders: FolderRecord[]) => {
    if (folders.length === 0) {
      return;
    }

    setFolderLookup((previous) => {
      const next = { ...previous };
      let changed = false;

      for (const folder of folders) {
        const existing = previous[folder.folderId];
        if (
          !existing ||
          existing.title !== folder.title ||
          existing.parentFolderId !== folder.parentFolderId
        ) {
          next[folder.folderId] = {
            folderId: folder.folderId,
            parentFolderId: folder.parentFolderId,
            title: folder.title,
          };
          changed = true;
        }
      }

      return changed ? next : previous;
    });
  }, []);

  useEffect(() => {
    registerFolders((rootFoldersQuery.data ?? []) as FolderRecord[]);
  }, [rootFoldersQuery.data, registerFolders]);

  useEffect(() => {
    registerFolders((childFoldersQuery.data ?? []) as FolderRecord[]);
  }, [childFoldersQuery.data, registerFolders]);

  const folders = currentFolderId
    ? ((childFoldersQuery.data ?? []) as FolderRecord[])
    : ((rootFoldersQuery.data ?? []) as FolderRecord[]);
  const items = currentFolderId
    ? ((itemsQuery.data ?? []) as ItemRecord[])
    : [];

  const rows = useMemo<Row[]>(() => {
    const folderRows: Row[] = folders.map((folder) => ({
      kind: "folder",
      id: folder.folderId,
      name: folder.title,
      updatedAt: folder.updatedAt,
      raw: folder,
    }));

    const itemRows: Row[] = items.map((item) => ({
      kind: "item",
      id: item.itemId,
      name: item.name,
      updatedAt: item.updatedAt,
      raw: item,
    }));

    const allRows = [...folderRows, ...itemRows];
    const term = search.trim().toLowerCase();
    if (!term) {
      return allRows;
    }
    return allRows.filter((row) => row.name.toLowerCase().includes(term));
  }, [folders, items, search]);

  const selectedItem = useMemo(() => {
    if (!selectedRow || selectedRow.kind !== "item") {
      return null;
    }
    return items.find((item) => item.itemId === selectedRow.id) ?? null;
  }, [items, selectedRow]);

  const selectedItemAttachmentQuery = useQuery({
    queryKey: ["knowledge", "attachment", selectedItem?.itemId ?? null],
    enabled: Boolean(selectedItem?.itemId),
    queryFn: () =>
      trpcClient.knowledge.getItemAttachment.query({
        itemId: selectedItem?.itemId ?? "",
      }),
  });

  const breadcrumbs = useMemo(() => {
    const root = [{ id: null as string | null, title: "Knowledge Base" }];
    if (!currentFolderId) {
      return root;
    }

    const chain: { id: string | null; title: string }[] = [];
    const seen = new Set<string>();
    let cursor: string | null = currentFolderId;

    while (cursor && !seen.has(cursor)) {
      seen.add(cursor);
      const folder:
        | { folderId: string; parentFolderId: string | null; title: string }
        | undefined = folderLookup[cursor];
      if (!folder) {
        break;
      }
      chain.unshift({ id: folder.folderId, title: folder.title });
      cursor = folder.parentFolderId;
    }

    return [...root, ...chain];
  }, [currentFolderId, folderLookup]);

  const currentFolder = currentFolderId ? folderLookup[currentFolderId] : null;
  const loading =
    rootFoldersQuery.isLoading ||
    childFoldersQuery.isLoading ||
    itemsQuery.isLoading;
  const isBusy = Boolean(pendingAction);

  const clearMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const refreshKnowledge = async () => {
    await queryClient.invalidateQueries({ queryKey: ["knowledge"] });
  };

  const handleOpenFolder = (folder: FolderRecord) => {
    setCurrentFolderId(folder.folderId);
    setSelectedRow(null);
  };

  const handleNavigateUp = () => {
    if (!currentFolder) {
      return;
    }
    setCurrentFolderId(currentFolder.parentFolderId);
    setSelectedRow(null);
  };

  const handleCreateFolder = async () => {
    const title = window.prompt("Folder name:");
    if (!title || !title.trim()) {
      return;
    }

    setPendingAction("create-folder");
    clearMessages();

    try {
      if (currentFolderId) {
        await trpcClient.knowledge.createFolderInFolder.mutate({
          parentFolderId: currentFolderId,
          title: title.trim(),
        });
      } else {
        await trpcClient.knowledge.createFolder.mutate({
          title: title.trim(),
        });
      }
      await refreshKnowledge();
      setSuccessMessage(`Created folder "${title.trim()}".`);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const openCreateItemForm = () => {
    if (!currentFolderId) {
      setErrorMessage("Open a folder first to add an item.");
      setSuccessMessage(null);
      return;
    }
    clearMessages();
    setShowCreateItemForm(true);
  };

  const resetCreateItemForm = () => {
    setNewItemTitle("");
    setNewItemDescription("");
    setNewItemBody("");
    setNewItemAttachment(null);
    setNewItemAttachmentInputKey((current) => current + 1);
  };

  const handleCreateItem = async () => {
    if (!currentFolderId) {
      setErrorMessage("Open a folder first to add an item.");
      setSuccessMessage(null);
      return;
    }
    const title = newItemTitle.trim();
    if (!title) {
      setErrorMessage("Item title is required.");
      setSuccessMessage(null);
      return;
    }

    setPendingAction("create-item");
    clearMessages();

    let uploadedFileId: string | null = null;
    let fileConfirmed = false;

    try {
      const item = await trpcClient.knowledge.createItem.mutate({
        folderId: currentFolderId,
        name: title,
        description: newItemDescription.trim() || undefined,
        body: newItemBody.trim() || undefined,
      });

      if (newItemAttachment) {
        const presign = await trpcClient.files.createPresignedUpload.mutate({
          fileName: newItemAttachment.name,
          contentType: newItemAttachment.type || undefined,
          fileSize: newItemAttachment.size,
        });
        uploadedFileId = presign.fileId;

        const uploadResponse = await fetch(presign.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type":
              newItemAttachment.type || "application/octet-stream",
          },
          body: newItemAttachment,
        });

        if (!uploadResponse.ok) {
          throw new Error(`Upload failed with status ${uploadResponse.status}`);
        }

        await trpcClient.files.confirmUpload.mutate({
          fileId: presign.fileId,
          fileName: newItemAttachment.name,
          storedName: presign.storedName,
          contentType: newItemAttachment.type || undefined,
        });
        fileConfirmed = true;

        await trpcClient.knowledge.createItemAttachment.mutate({
          itemId: item.itemId,
          fileId: presign.fileId,
        });
      }

      await refreshKnowledge();
      setSelectedRow({ kind: "item", id: item.itemId });
      setShowCreateItemForm(false);
      resetCreateItemForm();
      setSuccessMessage(`Added item "${item.name}".`);
    } catch (error) {
      if (uploadedFileId && fileConfirmed) {
        try {
          await trpcClient.files.deleteFile.mutate({ fileId: uploadedFileId });
        } catch {
          // Best-effort cleanup only.
        }
      }
      setErrorMessage(toErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  const handleOpenItem = async (item: ItemRecord) => {
    setPendingAction("open-item");
    clearMessages();

    try {
      const attachment = await trpcClient.knowledge.getItemAttachment.query({
        itemId: item.itemId,
      });

      if (!attachment) {
        setErrorMessage("This item has no file attached.");
        return;
      }

      const file = await trpcClient.files.getFile.query({
        fileId: attachment.fileId,
      });

      window.open(file.data, "_blank", "noopener,noreferrer");
      setSuccessMessage(`Opened "${item.name}".`);
    } catch (error) {
      setErrorMessage(toErrorMessage(error));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <TitleShell title="Knowledge Base">
      <div className="space-y-4">
        {errorMessage ? (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {errorMessage}
          </div>
        ) : null}
        {successMessage ? (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            {successMessage}
          </div>
        ) : null}

        <Card className="overflow-hidden py-0">
          <CardContent className="space-y-3 p-0">
            <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
              {breadcrumbs.map((crumb, index) => (
                <div
                  key={`${crumb.id ?? "root"}-${index}`}
                  className="flex items-center text-sm"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentFolderId(crumb.id);
                      setSelectedRow(null);
                    }}
                    className="rounded px-1 py-0.5 text-primary hover:bg-primary/10"
                    disabled={isBusy}
                  >
                    {crumb.title}
                  </button>
                  {index < breadcrumbs.length - 1 ? (
                    <ChevronRight className="mx-1 h-3.5 w-3.5 text-muted-foreground" />
                  ) : null}
                </div>
              ))}

              <div className="ml-auto flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleNavigateUp}
                  disabled={!currentFolderId || isBusy}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCreateFolder}
                  disabled={isBusy}
                >
                  <Plus className="h-4 w-4" />
                  Add Folder
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={openCreateItemForm}
                  disabled={isBusy || !currentFolderId}
                >
                  <Plus className="h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </div>

            {showCreateItemForm ? (
              <div className="space-y-2 border-b bg-muted/20 px-4 py-3">
                <p className="text-sm font-semibold text-secondary">New Item</p>
                <Input
                  placeholder="Title"
                  value={newItemTitle}
                  onChange={(event) => setNewItemTitle(event.target.value)}
                />
                <Input
                  placeholder="Description (optional)"
                  value={newItemDescription}
                  onChange={(event) =>
                    setNewItemDescription(event.target.value)
                  }
                />
                <Textarea
                  placeholder="Body (optional)"
                  value={newItemBody}
                  onChange={(event) => setNewItemBody(event.target.value)}
                  className="min-h-24"
                />
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">
                    Attachment (optional)
                  </p>
                  <Input
                    key={newItemAttachmentInputKey}
                    type="file"
                    onChange={(event) =>
                      setNewItemAttachment(event.target.files?.[0] ?? null)
                    }
                  />
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowCreateItemForm(false);
                      resetCreateItemForm();
                    }}
                    disabled={isBusy}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateItem}
                    disabled={isBusy}
                  >
                    Create Item
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="px-4 pb-3">
              <Input
                placeholder="Search by name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <div>
              <div className="grid grid-cols-[minmax(0,1fr)_16rem_6rem] border-y bg-muted/40 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <span>Name</span>
                <span>Date Modified</span>
                <span>Size</span>
              </div>
              <div className="max-h-[65vh] overflow-y-auto">
                {loading ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    Loading...
                  </p>
                ) : rows.length === 0 ? (
                  <p className="px-4 py-4 text-sm text-muted-foreground">
                    {currentFolderId
                      ? "This folder is empty."
                      : "No folders yet. Create one to get started."}
                  </p>
                ) : (
                  rows.map((row) => {
                    const isSelected =
                      selectedRow?.kind === row.kind &&
                      selectedRow.id === row.id;

                    return (
                      <button
                        key={`${row.kind}-${row.id}`}
                        type="button"
                        className={cn(
                          "grid w-full grid-cols-[minmax(0,1fr)_16rem_6rem] cursor-pointer items-center px-4 py-2 text-left",
                          isSelected
                            ? "border-l-2 border-primary bg-primary/20"
                            : "border-l-2 border-transparent hover:bg-primary/5",
                        )}
                        onClick={() =>
                          setSelectedRow({
                            kind: row.kind,
                            id: row.id,
                          })
                        }
                        onDoubleClick={() => {
                          if (row.kind === "folder") {
                            handleOpenFolder(row.raw);
                          } else {
                            handleOpenItem(row.raw);
                          }
                        }}
                      >
                        <span className="flex min-w-0 items-center gap-2">
                          {row.kind === "folder" ? (
                            row.id === currentFolderId ? (
                              <FolderOpen className="h-4 w-4 shrink-0 text-primary" />
                            ) : (
                              <Folder className="h-4 w-4 shrink-0 text-primary" />
                            )
                          ) : (
                            <FileText className="h-4 w-4 shrink-0 text-accent" />
                          )}
                          <span className="truncate">{row.name}</span>
                        </span>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(row.updatedAt)}
                        </span>
                        <span className="text-sm text-muted-foreground">—</span>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {selectedItem ? (
              <div className="space-y-2 border-t bg-muted/20 px-4 py-3">
                <p className="text-sm font-semibold text-secondary">
                  Item Contents
                </p>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium">Title:</span>{" "}
                    {selectedItem.name}
                  </p>
                  <p>
                    <span className="font-medium">Description:</span>{" "}
                    {selectedItem.description?.trim() || "—"}
                  </p>
                  <p className="whitespace-pre-wrap">
                    <span className="font-medium">Body:</span>{" "}
                    {selectedItem.body?.trim() || "—"}
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
                  <div className="text-xs text-muted-foreground">
                    {selectedItemAttachmentQuery.isLoading
                      ? "Loading attachment..."
                      : selectedItemAttachmentQuery.data
                        ? `Attachment: ${selectedItemAttachmentQuery.data.fileName}`
                        : "No attachment"}
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => handleOpenItem(selectedItem)}
                    disabled={
                      isBusy ||
                      selectedItemAttachmentQuery.isLoading ||
                      !selectedItemAttachmentQuery.data
                    }
                  >
                    Open Attachment
                  </Button>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </TitleShell>
  );
}
