# WebStorm: Go to Declaration fails for Yarn PnP workspace packages with peerDependencies

Minimal reproduction: in a Yarn PnP + TypeScript monorepo, **Cmd+Click (Go to Declaration)** on a symbol
imported from another workspace package does not navigate to its source **when that workspace package declares
`peerDependencies`**.
The reverse direction (**Find Usages** from the declaration) does find the usage in the other package.

A workspace package with `peerDependencies` is turned into a *virtual package* by Yarn PnP, so the TypeScript
server resolves its files under `.yarn/__virtual__/<name>-virtual-<hash>/1/packages/...` instead of the real
`packages/...` path. The real file and the virtual path are the same file on disk, but navigation seems to
not map the virtual path back to the project file.

## Setup

```bash
corepack enable
yarn install
yarn build   # emits dist/*.js only (no .d.ts), like an swc build
yarn check   # tsc --noEmit for packages/app — passes, so TypeScript itself resolves everything
```

Open the repository root in WebStorm and let indexing finish.

## Structure

| Package                 | peerDependencies | Barrel re-exports         | Resolved by tsc as                                                        |
|-------------------------|------------------|---------------------------|---------------------------------------------------------------------------|
| `packages/lib-relative` | –                | `./greeter/index.js`      | `packages/lib-relative/src/...`                                           |
| `packages/lib-subpath`  | –                | `#src/greeter/index.js`   | `packages/lib-subpath/src/...`                                            |
| `packages/lib-peer`     | `reflect-metadata` | `./greeter/index.js`    | `.yarn/__virtual__/@repro-lib-peer-virtual-<hash>/1/packages/lib-peer/src/...` |
| `packages/app`          | –                | –                         | consumer, depends on all three via `workspace:^`                          |

All libraries:

- `"type": "module"`
- `"exports": { ".": { "types": "./src/index.ts", "default": "./dist/src/index.js" } }` (types point at TS sources)
- `"imports": { "#src/*": "./src/*" }`
- `module` / `moduleResolution`: `NodeNext`
- `nodeLinker: pnp` (no `node_modules`, no `.yarn/sdks`)

The resolved paths can be checked with:

```bash
cd packages/app && yarn tsc --noEmit -p . --explainFiles | grep -v '^  ' | grep lib-
```

## Steps to reproduce

1. Open `packages/app/src/main.ts`.
2. Cmd+Click `createRelativeGreeter` / `greet` and `createSubpathGreeter` / `greet`.
3. Cmd+Click `createPeerGreeter` / `greet`.
4. Open `packages/lib-peer/src/greeter/greeter.ts`, place the caret on `createGreeter` / `greet`, and run Find Usages (Alt+F7).

## Expected

Steps 2 and 3 both navigate to `packages/lib-*/src/greeter/greeter.ts`.

## Actual

- Step 2: works — navigates to `packages/lib-relative/src/greeter/greeter.ts` / `packages/lib-subpath/src/greeter/greeter.ts`.
- Step 3: **does not navigate** to `packages/lib-peer/src/greeter/greeter.ts`.
  The only difference between `lib-relative` and `lib-peer` is the `peerDependencies` field.
- Step 4: Find Usages **does** list `packages/app/src/main.ts`.

## Environment

- WebStorm: 2026.2.3 (Build #WS-262.10968.77, built on September 17, 2026)
- macOS: 15.5 (24F74)
- Node.js: 24.11.0
- Yarn: 4.18.0 (PnP)
- TypeScript: 6.0.3
