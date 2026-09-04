# Packages

This directory is for shared workspace packages in the Vami monorepo.

To create a new package:
1. Create a folder (e.g., `packages/ui`)
2. Initialize it with a `package.json` naming it `@vami/ui`
3. Add it to `pnpm-workspace.yaml` if not already covered by `packages/*`
4. Use it in apps by adding `"@vami/ui": "workspace:*"` to their dependencies.
