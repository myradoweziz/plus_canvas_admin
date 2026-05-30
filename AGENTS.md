# Agent Routing — plus_canvas_admin

This project uses personalized Cursor subagents in `~/.cursor/agents/`.  
Route recurring task types to the **narrowest matching subagent** with the **cheapest capable model**.

## Routing table

| Task pattern | Subagent | Model |
|--------------|----------|-------|
| `@src/modules/...` edits, `daway delay`, `nusno dobawit`, new admin page `pohose na colors`, modals/tables/CRUD | `vue-admin-builder` | Codex 5.3 |
| Canvas/Fabric, collage, frames, effects, inner_images, slider, format/size preview | `canvas-editor-dev` | Codex 5.3 |
| TS/Vue errors, `build i ispraw osibki`, Vue warn, terminal Traceback, deploy/gunicorn | `debugger-build-fixer` | Codex 5.3 |
| `/api/media/upload`, upload progress, payload by index, filters/sort params, websocket | `api-upload-wire` | Codex 5.3 |
| Styles, modal overlay, mobile layout, spacing, `umensit`, screenshot UI tweaks | `ui-css-quick-fix` | Composer 2 Fast |
| `ubrat iz validasi`, required/optional, regex, maxLength, validationErrors | `forms-validation` | Composer 2 Fast |
| `yestli`, `pochemuta`, `pravilny uslowiye`, verify/explain without `daway delay` | `code-reviewer` | Composer 2 Fast |

## Rules

1. **Use matching subagents for recurring task types** — do not use the default agent when a subagent clearly fits.
2. **Direct execution only when no subagent matches** — fall back to general Agent mode with Codex 5.3 for one-off coding.
3. **When in doubt, choose the narrowest matching subagent** — e.g. validation-only → `forms-validation`, not `vue-admin-builder`.
4. **Use the cheapest capable model** — Composer 2 Fast for mechanical/UI/Q&A; Codex 5.3 for implementation/debug/API; avoid Opus/GPT-5.5 unless planning multi-system architecture (rare here).

## Typical triggers (from usage history)

- `nusno dobawit`, `daway delay`, `otdelny stranisa`, `apiUrl`, `@file:lines`
- `pohose na colors`, `MultiImageUpload`, `ProductCreateModal`, `AppSidebar`
- `collage_layout_id`, `canvas-frames`, `canvas-effects`
- `For the code present, we get this error`
- `ubrat iz validation`, `ne obyazatelny`
- `yestli zdes wse`, `pochemuta`

## Default model recommendation

Set **Codex 5.3** as your default in the Cursor model picker for this repo (most work is Vue admin implementation).  
Use subagents for Composer 2 Fast tasks instead of changing global defaults per task.
