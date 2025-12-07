import z from "zod";
import { SearchRepository } from "../data/repository/search-repo.js";
import { SearchService } from "../service/search-service.js";
import { withErrorHandling } from "../trpc/error_handler.js";
import { protectedProcedure, router } from "../trpc/trpc.js";
import { searchResultSchema, typeaheadSchema } from "../types/search-types.js";

const searchService = new SearchService(new SearchRepository());

const typeahead = protectedProcedure
  .meta({
    description: "Typeahead suggestions for the UI search bar",
  })
  .input(typeaheadSchema)
  .output(z.array(searchResultSchema))
  .meta({
    openapi: {
      method: "POST",
      path: "/search.typeahead",
      summary:
        "Typeahead suggestions for the UI search bar. Searches users, channels, and universities by name",
      tags: ["Search"],
    },
  })
  .query(async ({ input, ctx }) => {
    return withErrorHandling("typeahead", async () => {
      const userId = ctx.auth.user.id;

      return await searchService.getTypeAheadSuggestions(
        input.query,
        userId,
        input.limit,
        input.searchType,
      );
    });
  });

export const searchRouter = router({
  typeahead,
});
