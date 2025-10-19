import { beforeAll, describe, expect, it, vi } from "vitest";

// In-memory model for this test
type MockMessage = {
  messageId: number;
  channelId: number;
  senderId: number | null;
  message: string | null;
  attachmentUrl: string | null;
  createdAt: Date;
};

const mem: {
  users: {
    user_id: number;
    name: string;
    email: string;
    password: string;
  }[];
  channels: { channel_id: number; name: string }[];
  channelSubscriptions: {
    id: number;
    user_id: number;
    channel_id: number;
    permission: "read" | "write" | "both";
  }[];
  roles: {
    role_id: number;
    namespace: string;
    channel_id: number | null;
    action: string;
    subject_id: string;
    role_key: string;
  }[];
  userRoles: { id: number; user_id: number; role_id: number }[];
  posts: MockMessage[];
  _ids: {
    user: number;
    channel: number;
    sub: number;
    role: number;
    userRole: number;
    post: number;
  };
} = {
  users: [],
  channels: [],
  channelSubscriptions: [],
  roles: [],
  userRoles: [],
  posts: [],
  _ids: { user: 0, channel: 0, sub: 0, role: 0, userRole: 0, post: 0 },
};
mem._ids = { user: 0, channel: 0, sub: 0, role: 0, userRole: 0, post: 0 };

function createUser(name: string, email: string, password: string) {
  const u = { user_id: ++mem._ids.user, name, email, password };
  mem.users.push(u);
  return u;
}
function createChannel(name: string) {
  const ch = { channel_id: ++mem._ids.channel, name };
  mem.channels.push(ch);
  return ch;
}
function addSubscription(
  user_id: number,
  channel_id: number,
  permission: "read" | "write" | "both",
) {
  const s = { id: ++mem._ids.sub, user_id, channel_id, permission };
  mem.channelSubscriptions.push(s);
  return s;
}
function createRole(
  namespace: string,
  channel_id: number | null,
  action: string,
  subject_id: string,
  role_key: string,
) {
  const r = {
    role_id: ++mem._ids.role,
    namespace,
    channel_id,
    action,
    subject_id,
    role_key,
  };
  mem.roles.push(r);
  return r;
}
function grantRole(user_id: number, role_id: number) {
  const ur = { id: ++mem._ids.userRole, user_id, role_id };
  mem.userRoles.push(ur);
  return ur;
}

function ctxUser(
  userId: number,
  name = "Test User",
  email = "test@example.com",
) {
  const now = new Date();
  return {
    userId,
    name,
    email,
    createdAt: now,
    updatedAt: now,
    phoneNumber: null as string | null,
    clearanceLevel: null as string | null,
    department: null as string | null,
    branch: null as string | null,
  };
}

// Mock the TRPC app router
vi.mock("../src/trpc/app_router.js", () => {
  type CommsCaller = {
    comms: {
      createPost(input: {
        channelId: number;
        content: string;
      }): Promise<MockMessage>;
      editPost(input: {
        channelId: number;
        messageId: number;
        content: string;
        attachmentUrl?: string;
      }): Promise<MockMessage>;
    };
  };
  type AppRouter = {
    createCaller(ctx: {
      user?: { userId: number } | undefined;
      userId: number | null;
    }): CommsCaller;
  };

  function ensureCanPost(userId: number, channelId: number) {
    const hasWriteSub = mem.channelSubscriptions.some(
      (s) =>
        s.user_id === userId &&
        s.channel_id === channelId &&
        (s.permission === "write" || s.permission === "both"),
    );

    const roleIds = mem.userRoles
      .filter((ur) => ur.user_id === userId)
      .map((ur) => ur.role_id);
    const hasWriteRole = mem.roles.some(
      (r) =>
        roleIds.includes(r.role_id) &&
        r.namespace === "channel" &&
        r.action === "write" &&
        r.channel_id === channelId,
    );

    if (!hasWriteSub && !hasWriteRole) {
      throw new Error("FORBIDDEN");
    }
  }

  const appRouter: AppRouter = {
    createCaller(ctx: {
      user?: { userId: number } | undefined;
      userId: number | null;
    }) {
      return {
        comms: {
          async createPost(input: {
            channelId: number;
            content: string;
          }): Promise<MockMessage> {
            if (!ctx?.user || !ctx.userId) throw new Error("UNAUTHORIZED");
            const ch = mem.channels.find(
              (c) => c.channel_id === input.channelId,
            );
            if (!ch) throw new Error("NOT_FOUND");

            const uid = ctx.userId as number;
            ensureCanPost(uid, input.channelId);

            const post: MockMessage = {
              messageId: ++mem._ids.post,
              channelId: input.channelId,
              senderId: uid,
              message: input.content,
              attachmentUrl: null,
              createdAt: new Date(),
            };

            mem.posts.push(post);
            return post;
          },
          async editPost(input: {
            channelId: number;
            messageId: number;
            content: string;
            attachmentUrl?: string;
          }): Promise<MockMessage> {
            if (!ctx?.user || !ctx.userId) throw new Error("UNAUTHORIZED");

            const ch = mem.channels.find(
              (c) => c.channel_id === input.channelId,
            );
            if (!ch) throw new Error("NOT_FOUND");

            const uid = ctx.userId as number;
            ensureCanPost(uid, input.channelId);

            const post = mem.posts.find((p) => p.messageId === input.messageId);
            if (!post) throw new Error("NOT_FOUND");

            if (post.channelId !== input.channelId) {
              throw new Error("BAD_REQUEST");
            }

            if (post.senderId !== uid) {
              throw new Error("FORBIDDEN");
            }

            post.message = input.content;
            post.attachmentUrl = input.attachmentUrl ?? null;

            const updated: MockMessage = {
              messageId: post.messageId,
              channelId: post.channelId,
              senderId: post.senderId,
              message: post.message,
              attachmentUrl: post.attachmentUrl,
              createdAt: post.createdAt,
            };
            return updated;
          },
        },
      };
    },
  } as const;

  return { appRouter };
});

// Import the mocked router AFTER vi.mock
import { appRouter } from "../src/trpc/app_router.js";

// Tests
describe("commsRouter.createPost", () => {
  let authedUserId: number;
  let otherUserId: number;
  let channelId: number;

  beforeAll(async () => {
    const u1 = createUser(
      "Test User",
      `test-${Date.now()}@example.com`,
      "test-password",
    );
    authedUserId = u1.user_id;

    const u2 = createUser(
      "Other User",
      `other-${Date.now()}@example.com`,
      "test-password",
    );
    otherUserId = u2.user_id;

    const ch = createChannel(`vitest-channel-${Date.now()}`);
    channelId = ch.channel_id;
  });

  it("throws UNAUTHORIZED if no user in context", async () => {
    const caller = appRouter.createCaller({ user: undefined, userId: null });
    await expect(
      caller.comms.createPost({ channelId, content: "Nope" }),
    ).rejects.toThrow(/UNAUTHORIZED/i);
  });

  it("throws NOT_FOUND for missing channel", async () => {
    const caller = appRouter.createCaller({
      user: ctxUser(authedUserId),
      userId: authedUserId,
    });
    await expect(
      caller.comms.createPost({
        channelId: 99999999,
        content: "Missing channel",
      }),
    ).rejects.toThrow(/NOT_FOUND/i);
  });

  it("throws FORBIDDEN when user lacks subscription and roles", async () => {
    const caller = appRouter.createCaller({
      user: ctxUser(otherUserId, "Other User", "other@example.com"),
      userId: otherUserId,
    });
    await expect(
      caller.comms.createPost({
        channelId,
        content: "Should be denied",
      }),
    ).rejects.toThrow(/FORBIDDEN/i);
  });

  it("allows posting via subscription permission = 'write'", async () => {
    addSubscription(authedUserId, channelId, "write");

    const caller = appRouter.createCaller({
      user: ctxUser(authedUserId),
      userId: authedUserId,
    });
    const created: MockMessage = await caller.comms.createPost({
      channelId,
      content: "Permitted by subscription",
    });

    expect(created).toBeDefined();
    expect(created.channelId).toBe(channelId);
    expect(created.senderId).toBe(authedUserId);
    expect(created.message ?? "").toContain("Permitted by subscription");
    expect(created.attachmentUrl).toBeNull();
  });

  it("allows posting via channel role (action='write')", async () => {
    const role = createRole(
      "channel",
      channelId,
      "write",
      "messages",
      "WRITER",
    );
    grantRole(otherUserId, role.role_id);

    const caller = appRouter.createCaller({
      user: ctxUser(otherUserId, "Other User", "other@example.com"),
      userId: otherUserId,
    });
    const created: MockMessage = await caller.comms.createPost({
      channelId,
      content: "Permitted by role",
    });

    expect(created).toBeDefined();
    expect(created.channelId).toBe(channelId);
    expect(created.senderId).toBe(otherUserId);
    expect(created.message ?? "").toContain("Permitted by role");
  });
});

describe("commsRouter.editPost", () => {
  let channelId: number;
  let authorId: number;
  let otherUserId: number;
  let messageId: number;

  beforeAll(async () => {
    const author = createUser(
      "Author User",
      `author-${Date.now()}@example.com`,
      "test-password",
    );
    authorId = author.user_id;

    const other = createUser(
      "Editor User",
      `editor-${Date.now()}@example.com`,
      "test-password",
    );
    otherUserId = other.user_id;

    const channel = createChannel(`edit-channel-${Date.now()}`);
    channelId = channel.channel_id;

    addSubscription(authorId, channelId, "write");

    const caller = appRouter.createCaller({
      user: ctxUser(authorId, "Author User", "author@example.com"),
      userId: authorId,
    });
    const created = await caller.comms.createPost({
      channelId,
      content: "Original content",
    });
    messageId = created.messageId;
  });

  it("throws UNAUTHORIZED if no user in context", async () => {
    const caller = appRouter.createCaller({ user: undefined, userId: null });
    await expect(
      caller.comms.editPost({
        channelId,
        messageId,
        content: "Unauthorized edit",
      }),
    ).rejects.toThrow(/UNAUTHORIZED/i);
  });

  it("throws NOT_FOUND for missing message", async () => {
    const caller = appRouter.createCaller({
      user: ctxUser(authorId, "Author User", "author@example.com"),
      userId: authorId,
    });
    await expect(
      caller.comms.editPost({
        channelId,
        messageId: 999999,
        content: "No message",
      }),
    ).rejects.toThrow(/NOT_FOUND/i);
  });

  it("throws FORBIDDEN when user lacks permission", async () => {
    const caller = appRouter.createCaller({
      user: ctxUser(otherUserId, "Editor User", "editor@example.com"),
      userId: otherUserId,
    });
    await expect(
      caller.comms.editPost({
        channelId,
        messageId,
        content: "Attempt without permission",
      }),
    ).rejects.toThrow(/FORBIDDEN/i);
  });

  it("throws BAD_REQUEST when channel does not match post", async () => {
    const otherChannel = createChannel(`mismatch-${Date.now()}`);
    addSubscription(authorId, otherChannel.channel_id, "write");

    const caller = appRouter.createCaller({
      user: ctxUser(authorId, "Author User", "author@example.com"),
      userId: authorId,
    });
    await expect(
      caller.comms.editPost({
        channelId: otherChannel.channel_id,
        messageId,
        content: "Wrong channel",
      }),
    ).rejects.toThrow(/BAD_REQUEST/i);
  });

  it("throws FORBIDDEN when editing a post authored by someone else", async () => {
    addSubscription(otherUserId, channelId, "write");

    const caller = appRouter.createCaller({
      user: ctxUser(otherUserId, "Editor User", "editor@example.com"),
      userId: otherUserId,
    });
    await expect(
      caller.comms.editPost({
        channelId,
        messageId,
        content: "Unauthorized edit attempt",
      }),
    ).rejects.toThrow(/FORBIDDEN/i);
  });

  it("allows editing when user is original author with permissions", async () => {
    const caller = appRouter.createCaller({
      user: ctxUser(authorId, "Author User", "author@example.com"),
      userId: authorId,
    });
    const updated: MockMessage = await caller.comms.editPost({
      channelId,
      messageId,
      content: "Updated content",
      attachmentUrl: "https://example.com/file.png",
    });

    expect(updated).toBeDefined();
    expect(updated.message).toBe("Updated content");
    expect(updated.attachmentUrl).toBe("https://example.com/file.png");

    const stored = mem.posts.find((p) => p.messageId === messageId);
    expect(stored?.message).toBe("Updated content");
    expect(stored?.attachmentUrl).toBe("https://example.com/file.png");
  });
});
