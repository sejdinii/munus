import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // .claude/worktrees holds parallel agent worktrees during build waves —
    // scanning them double-counts every suite and inflates test totals.
    exclude: ["**/node_modules/**", ".claude/**", ".next/**"],
  },
});
