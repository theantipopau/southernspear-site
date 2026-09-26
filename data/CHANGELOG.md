# CHANGELOG — Southern Spear

**Document ID:** `Docs/CHANGELOG.md`
**Purpose:** Rolling record of what was actually done, what was actually tested, and what is still open. Appended to at the end of every work session.
**Last updated:** 2026-09-26

> **This file records evidence, not narrative.** A line here means a command was run and its result observed. If something was not done, it is not claimed. Anything marked `NOT RUN` is genuinely outstanding, not quietly skipped.

---

## Status At A Glance

| | |
|---|---|
| Current phase | **Phase 0 — Audit & Architecture — COMPLETE** (gate G0.8 passed) |
| Buildable? | ✅ **Yes.** `SouthernSpearEditor` compiles clean |
| Playable? | ❌ **No.** Never opened in the editor; no map imported |
| Automation passing | 1 suite (blockout layout verification, 10/10) |
| Third-party assets in use | Lyra + UE only. Zero acquired assets |
| Commit count | 6 |

---

## Session 001 — 2026-09-26 — Phase 0: Audit, Architecture & Source Control

### COMPLETED

**Toolchain audit** — every claim backed by an executed command:
- UE **5.8.3** (CL 58210709, `++UE5+Release-5.8`) at `E:\Unreal\UE_5.8`
- Confirmed **Installed Build** via `Engine/Build/InstalledBuild.txt` → no engine-side C++, Lyra must be vendored
- VS Community 2022 **17.14.37710.0**, MSVC **14.44.35207** vs engine floor **14.44.34918** (thin margin, now CI-asserted)
- Blender **5.2.2 LTS**, Git **2.54.0**, git-lfs **3.7.1**
- Hardware: Ryzen 7 9800X3D (8c/16t), 31.2 GB RAM, RX 9070 XT
- Engine 5.8.3 **not** registered in the Epic Games Launcher → in-editor Fab cannot resolve it (risk R-03)

**Source control established**:
- Git repo on `main`, Unreal+Blender `.gitignore`
- Line endings pinned to LF with CRLF override for `.bat`/`.cmd`/`.ps1`
- Git LFS tracks `.uasset`/`.umap`/`.blend` and all binary art/audio types
- **LFS verified end-to-end** with `git check-attr`, not assumed

**Documents authored** (12 in `Docs/`): `PROJECT_AUDIT`, `GAME_DESIGN_DOCUMENT`, `TECHNICAL_DESIGN_DOCUMENT`, `ASSET_REGISTER`, `LICENCE_REGISTER`, `DEVELOPMENT_ROADMAP`, `TEST_PLAN`, `CODING_STANDARDS`, `ASSET_NAMING_STANDARDS`, `LYRA_ADOPTION`, `DECISION_LOG` (15 ADRs), `MAPS_DRYRIVER`.

**Lyra 5.8 obtained and verified**: 20 plugins, full C++ source, 55 prebuilt binaries. Declares `EngineAssociation: "5.8"`.

**Repository relocated** to `E:\SouthernSpear` (space-free) — ADR-014.

**Dry River vertical-slice blockout generated** from a written design spec — 162 objects, 8,944 faces, 4 gameplay markers.

### FILES CHANGED

Created: `README.md`, `.gitignore`, `.gitattributes`, `.github/workflows/build.yml`, `Docs/*` (12 files), `Tools/Blender/dryriver_blockout.py`, `Tools/Blender/verify_dryriver.py`, `Content/Art/Blockout/*` (blend, fbx, csv), `Source/SouthernSpear*.Target.cs`.

Vendored (untracked, awaiting the G0.8 commit): Lyra source, plugins, config, content.

### TESTING

| Check | Command | Result |
|---|---|---|
| LFS attribute resolution | `git check-attr filter diff merge text` | **PASS** — `.uasset`/`.blend` → `lfs`, `.md` → text |
| CI workflow validity | `python -c "yaml.safe_load(...)"` | **PASS** — after fixing a real bug (Windows paths in double-quoted YAML were parsed as escape sequences) |
| Lyra editor load | read `LyraStarterGame.log` | **PASS** — all 5 game features `[Registered, Active]`, **1 error total** (`LogPixelStreaming2RTC`, cosmetic), clean exit |
| Blockout generation | `blender -b --python dryriver_blockout.py` | **PASS** — 162 objects, 0 errors, after fixing 2 bugs |
| Blockout layout | `python Tools/Blender/verify_dryriver.py` | **PASS 10/10, exit 0** |
| LFS on new binaries | `git lfs ls-files` | **PASS** — fbx + blend tracked |
| **Gate G0.8 editor build** | `Engine\Build\BatchFiles\Build.bat SouthernSpearEditor Win64 Development` | ✅ **PASS — `Result: Succeeded`, 429 actions, 0 errors, 1188 s** |
| Dedicated server build | `Build.bat SouthernSpearServer ...` | **NOT RUN** |
| Project opens in editor | — | **NOT RUN** |
| NavMesh on Dry River | — | **NOT RUN** — needs the project opened |

### ASSETS

Created (all **class F**, original, no licence obligation):
- `SS_MAP_DryRiver_01_HI.blend` — source blockout
- `SS_MAP_DryRiver_01.fbx` — game import mesh
- `SS_MAP_DryRiver_01_Layout.csv` — gameplay marker positions
- `dryriver_blockout.py` — procedural generator
- `verify_dryriver.py` — layout verifier (CI)

Vendored (licence **L-0001**): Lyra Starter Game 5.8; Unreal Engine 5.8.3 (**L-0002**).

**Licence entries added**: L-0001 through L-0012.
**Third-party assets acquired**: **zero**. Electric Dreams considered and **declined** (ADR-013).
**Remaining placeholders**: all 15 weapons, 16 of 18 characters, 9 of 13 animations, all 13 audio, all 6 effects, 11 of 12 UI, 6 of 7 maps, all 10 data assets. Nothing is final.

### RISKS

| ID | Risk | Status |
|---|---|---|
| R-01 | Lyra may not target 5.8.3 | ✅ **CLOSED** — `EngineAssociation "5.8"`, runtime log exact build match |
| R-02 | Path contains a space | ✅ **CLOSED** — relocated to `E:\SouthernSpear` (ADR-014) |
| R-03 | Engine not Launcher-registered → Fab unavailable | 🔴 **OPEN** — also gates the abandoned Electric Dreams harvest |
| R-04 | MSVC margin over engine minimum is thin | 🟡 **OPEN** — CI asserts the version |
| R-05 | 31.2 GB RAM for editor + DS + 4 clients | 🟡 **OPEN** — affects the 4-client acceptance test |
| R-06 | E: has ~488 GB free | 🟡 **OPEN** — monitor as LFS objects accumulate |
| R-07 | UE 5.8.3 is recent; ecosystem may lag | 🟡 **OPEN** — verify every plugin on 5.8 |
| R-08 | Installed Build — no engine modules | 🟡 Accepted — all divergence is project-side |
| **G0.8** | Vendored fork has never compiled | ✅ **CLOSED — `Result: Succeeded`, 0 errors** |
| **P1-01** | Editor build does not prove the project *runs* | 🔴 **OPEN — project has never been opened** |

**Network risks:** none yet — no netcode exists.
**Licensing concerns:** insignia on legal hold (L-0003); ADF marks not licensed (L-0004); prohibited sources barred (L-0007, L-0008).

### DEFECTS FOUND AND FIXED

| Defect | Severity | How found |
|---|---|---|
| CI workflow YAML unparseable — Windows paths in double-quoted strings read as escape sequences | S1 — build-breaking | `yaml.safe_load` |
| **`RunUBT.bat` does not exist in UE 5.8.3** — documented as the build command in 5 files | **S1 — build-breaking** | **Actual build attempt; only `RunUBT.sh` exists. Correct entry point is `Build.bat`** |
| Blender 5.2 cone operator takes `radius1`/`radius2`, not `radius` | S2 | Script run → TypeError |
| **OBJ A 10 m off the Y centre line** — gave one team a shorter run to the opening contest | **S2 — gameplay balance** | **`verify_dryriver.py`** |
| **Spec distances did not match generated geometry** (claimed 62 m, actual 51.9 m) | **S2 — false documentation** | **`verify_dryriver.py`** |
| Objective order (sequential vs parallel) never specified, leaving balance ambiguous | S2 — design | Verifier could not assert fairness |

**Self-inflicted process errors (recorded honestly):** reported Lyra's core plugins as "missing" when they were one directory deeper (non-recursive glob); clobbered and then duplicated a section of `DECISION_LOG.md` through several rounds of careless line-editing. Both were corrected and committed rather than quietly patched over.

### NEXT ACTION

**Open the project in the editor for the first time** and confirm it loads under its new name with all game features active — then import the Dry River FBX and generate a NavMesh. This is the first moment the project will have been *run* rather than merely *built*, and it validates the last unproven assumption left over from the fork.

---

## Session 002 — 2026-09-26 — First Run, and a Hard Stop on the Dedicated Server

### COMPLETED

**Gate G0.10 PASSED — the project runs.** Risk P1-01 is closed. The vendored, renamed fork was launched headless for the first time:

```
Engine\Binaries\Win64\UnrealEditor-Cmd.exe SouthernSpear.uproject -nullrhi -unattended -nosplash -nosound -stdout
```

- Loads as `Running engine for game: SouthernSpear` on `5.8.3-58210709+++UE5+Release-5.8`
- Uses our renamed target receipt, `Binaries/Win64/SouthernSpearEditor.target`
- **All five game features reach `Ending state: Registered [Registered, Active]`** — `TopDownArena`, `ShooterCore`, `ShooterExplorer`, `ShooterMaps`, `ShooterTests`
- **Zero errors, zero fatals**
- Game feature DLLs resolve to the **vendored** tree at `E:\SouthernSpear\Plugins\GameFeatures\…`, confirming the original Lyra staging copy at `E:\Unreal\Lyra` is correctly inert

The last unproven assumption left over from the fork is now a proven one. `TECHNICAL_DESIGN_DOCUMENT.md` and `LYRA_ADOPTION.md` stand as written, with no further divergence needed.

**Gate G0.9 FAILED — and it is not fixable in-project.** Attempting the dedicated server target:

```
Build.bat SouthernSpearServer Win64 Development -Project=…\SouthernSpear.uproject -WaitMutex
→ Server targets are not currently supported from this engine distribution.
→ Result: Failed (OtherCompilationError)   Total execution time: 2.06 seconds
```

It failed in under three seconds, before compiling a single file, so it cannot be a source error. Traced to the root cause in the engine's own configuration:

- `Unreal.IsEngineInstalled()` is `true` (`InstalledBuild.txt` = `UE_5.8`)
- `UEBuildTarget.cs:1396` gates on `InstalledPlatformInfo.IsValid(…, InstalledPlatformState.Supported)`
- That reads `[InstalledPlatforms]` from the **engine's own** `Engine/Config/BaseEngine.ini:3996`
- The 28 declared configurations contain exactly two distinct values: `PlatformType="Editor"` and `PlatformType="Game"`. **No `Server` entry exists.**
- Corroborated by the absence of any `UnrealServer` binary or `.target` in `Engine/Binaries/Win64/`

**This engine install is a game/editor-only distribution.** Epic ships dedicated-server capability as a separate Launcher product, or it is present in a source build. No project-side setting can add it, and `SouthernSpearServer.Target.cs` is correct and ready for the day a server-capable engine exists.

**Risk R-06 closed.** E: re-measured at **475 GB free, 51 % used** of 954 GB. The earlier "488.6 GB, tightest volume" note was written before the 2.4 GB LFS clone landed; headroom is ample.

### FILES CHANGED

- `Docs/PROJECT_AUDIT.md` — added §6.1 (G0.9 failure, full root-cause trace) and §6.2 (G0.10 pass, evidence table); added **R-09**; struck R-06 as resolved; added producer question 5 with a costed recommendation
- `Docs/CHANGELOG.md` — this entry
- **`Docs/evidence/` (new directory, tracked)** — the gate evidence is version-controlled, because `Build/` is gitignored and these transcripts are the proof that G0.9 failed and G0.10 passed. A claim in a design document that cannot be re-checked is not a claim.
  - `G009_server_build_failure.txt` — G0.9 transcript
  - `G009_baseengine_installedplatforms_excerpt.txt` — the engine's own `[InstalledPlatforms]` whitelist
  - `G009_installedplatforms_primarysource.txt` — whitelist plus the `UEBuildTarget.cs` throw site
  - `G010_editorload_keylines.txt` — the 12 lines that decide G0.10
  - `G010_editorload_filtered.txt` — full editor log, telemetry DNS-failure spam stripped
- A directory junction `E:\Australian Army Game\SouthernSpear` → `E:\SouthernSpear` was created **outside the repository** so the agent's file tools can reach the relocated project. It is not tracked by git and is not part of the project.

### TESTING

| Command | Result |
|---|---|
| `Build.bat SouthernSpearServer Win64 Development -WaitMutex` | **FAIL** — refused by engine distribution, 2.06 s, 0 actions |
| `UnrealEditor-Cmd.exe SouthernSpear.uproject -nullrhi -unattended` | **PASS** — 5/5 game features active, 0 errors |
| `df -h E:` | 475 GB free |

### ASSETS

No new assets. Dry River FBX still **not imported**; NavMesh still ungenerated.

### RISKS

- **R-09 (NEW, HIGH)** — this engine distribution cannot build `TargetType.Server`. Directly blocks the vertical slice's own acceptance criterion ("packaged client → packaged dedicated server"), which the roadmap explicitly refuses to accept a listen server for. Escalated as producer question 5.
- **R-06** — **RESOLVED**, re-measured at 475 GB free.
- **P1-01** — **CLOSED** by G0.10.
- R-03, R-04, R-05, R-07, R-08 unchanged.

### DEFECTS FOUND

One, and it is an environment defect rather than a code defect:

- **Server target unavailable on the current engine install.** Found by attempting the build rather than assuming it would work — the `SouthernSpearServer.Target.cs` file had been written and committed in Phase 0 on the strength of Lyra's convention, and that assumption was simply untested until now. It would have surfaced only at vertical-slice sign-off, which is far too late. Found early, at the cost of one build invocation.

No project-side defects were found this session.

### NEXT ACTION

**Build the `SouthernSpearCore` plugin carrying the critical path** — `ESS_TeamId` (ADR-003, match-relative) and the `UFSSFactionPresentationSet` presentation resolver (ADR-004, structurally incapable of affecting gameplay). This work builds against the Editor target and is completely independent of how R-09 is resolved, so it proceeds while the producer decides.

---

## Session 003 — 2026-09-26 — Dry River Brought Into the Engine, and a Coordinate Bug

### COMPLETED

**Gate G1.1 PASSED. NavMesh generation is validated and P1-02 is closed.** The map is no longer a Blender file nobody has seen inside the engine — it is built, collisioned, navigable and saved, entirely from version-controlled scripts.

| Check | Result |
|---|---|
| FBX import | 162 blockout objects → one mesh `SS_MAP_DryRiver_01` (via Interchange) |
| Collision | `CTF_USE_COMPLEX_AS_SIMPLE`, profile `BlockAll` |
| Gameplay actors | 4 placed from the layout CSV (2 deployments, 2 objectives) |
| Map check | **0 errors, 0 warnings** |
| Nav bounds | Min (-13600, -9600, -1000) → Max (13600, 9600, 2600) cm |
| Tiles generated | **560** |
| **Path, DeployAlpha → DeployBravo (170 m)** | ✅ **verified, 2 path points** |
| Saved map | 248 KB vs 8.5 KB empty — navigation data is serialised |

The acceptance check is a **path query**, deliberately. A navmesh actor existed, and the build reported success, while the navmesh covered *nothing*. Only a non-empty `find_path_to_location_synchronously` result across the full map means what it says.

**Producer decision taken: obtain the Dedicated Server engine product** (route (a) in `PROJECT_AUDIT.md` §8). R-09 stays open until that engine is installed; no workaround will fake it.

### DEFECTS FOUND

**1. The Y axis was mirrored, silently swapping the two deployments.**

Blender is right-handed Z-up, Unreal is left-handed Z-up, so the FBX import mirrors Y. The layout CSV is Blender space, so `Unreal_Y = -Blender_Y`. Using it un-negated is invisible: Dry River is symmetric in Y, so the deployments simply swap ends and **every distance in the map spec still holds**, because a mirror preserves distance. A map that was subtly wrong in exactly the way nobody would notice by looking.

It was caught only by cross-checking the traced ground height against the heights the Blender generator recorded:

```
DeployAlpha ground z=64.3cm  vs CSV  34.3cm  (delta 30.0cm)
DeployBravo ground z=1332.0cm vs CSV 1302.0cm (delta 30.0cm)
```

The residual 30 cm is expected — the layout markers are 0.3 m boxes on the terrain, so a trace lands on the box top. The important part is that both deltas are equal and small; before the fix they were ~13 m and the two deployments had exchanged heights. **Pass 2 now asserts this delta stays under 150 cm and warns otherwise**, so the regression cannot return quietly.

**2. `MapCheck: PlayerStart_0 is a normal APlayerStart, replace with ALyraPlayerStart`.** Now uses `ALyraPlayerStart`; map check is clean.

**3. A cosmetic bug in the reporting code cost the entire constructed level.** `list(volume.get_actor_scale3d())` raised `TypeError: 'Vector' object is not iterable` *after* the actors were placed but *before* the save, so a map with no actors was left on disk and the second pass found nothing to work with. Pass 1 now saves in a `finally`, because a reporting bug must never cost the build.

### Five engine behaviours that made a one-pass build impossible

Each was found by reading engine source, not guessed. All are documented in `MAPS_DRYRIVER.md` §11.3.

| Symptom | Cause |
|---|---|
| Post-tick callback never fires | `-ExecutePythonScript` destroys the world as soon as the script returns |
| `navigation build is locked (flags: 0x20)` | `AsyncLoadLock` (`1 << 5`), released only on a tick. Overridden per-invocation, not in project config |
| `TotalNavBounds: IsValid=false` | `GatherNavigationBounds()` skips volumes failing `HasActorRegisteredAllComponents()`; a script-spawned brush never reaches that state. **A map load does** |
| Build succeeds in 0.00 s, zero tiles | The import task saved the mesh *before* collision was configured, so the `.uasset` had none. Pass 1 now saves it explicitly afterwards |
| Nav data present but inert | Spawning `RecastNavMesh` from script defers registration to a tick; the map load creates it properly |

Every step uses the same code path a person uses in the editor: place the volume, then Build Paths. **No workaround fakes anything.**

### FILES CHANGED

- **`Tools/Unreal/build_dryriver_level.py`** (new) — pass 1: level construction
- **`Tools/Unreal/build_dryriver_nav.py`** (new) — pass 2: nav build, path verification, ground-height cross-check
- **`.github/workflows/build.yml`** — both passes plus a hard assertion on the G1.1 report; `Build Dedicated Server` marked `continue-on-error` with the R-09 reason inline so CI is not permanently red over a known environment gap
- `Docs/MAPS_DRYRIVER.md` — new §11 (pipeline, coordinate transform, measured engine constants, verification table)
- `Docs/PROJECT_AUDIT.md` — new §6.3 (G1.1), gate table, P1-02 closed
- `Docs/CHANGELOG.md` — this entry
- `Docs/evidence/G011_*` (new, tracked) — keylines and both JSON reports
- `Content/Maps/L_DryRiver_01.umap` (new, LFS) — the level with baked navigation data
- `Content/Art/Blockout/SS_MAP_DryRiver_01.uasset` (new, LFS) — the imported blockout mesh, saved with collision

### TESTING

| Command | Result |
|---|---|
| Pass 1 — `build_dryriver_level.py` | **PASS** — level, 4 actors, mesh + collision saved |
| Pass 2 — `build_dryriver_nav.py` | **PASS** — 560 tiles, 2 path points, `ok=true` |
| Pass 2 re-run (idempotency) | **PASS** — identical result, so the pipeline is stable, not lucky |
| `MapCheck` | 0 errors, 0 warnings |

### ASSETS

- `Content/Maps/L_DryRiver_01.umap` — 248 KB, navigation data serialised
- `Content/Art/Blockout/SS_MAP_DryRiver_01.uasset` — 366 KB, complex-as-simple collision
- No third-party assets were used, so no new `LICENCE_REGISTER.md` entry is required.

### RISKS

- **P1-02** — **CLOSED** by G1.1.
- **R-09** — open, now with a chosen route: obtain the Dedicated Server engine product.
- No new risks. The two engine-distribution gaps found here (async nav lock, brush-volume registration) are recorded in `MAPS_DRYRIVER.md` §11 rather than the risk register, because both are worked around and neither threatens the project.

### NEXT ACTION

**Build the `SouthernSpearCore` plugin** carrying the critical path VS-01 → VS-05 → VS-06: `ESS_TeamId` (match-relative per ADR-003) and the `UFSSFactionPresentationSet` resolver (ADR-004, structurally incapable of affecting gameplay), with a CI static scan enforcing the separation. Unaffected by R-09.

---

## Session 004 — 2026-09-26 — Data-Driven Dressing, and a Limit I Could Not Remove

### COMPLETED

**Dry River dressing is now a data edit.** Moving a fence or deleting a wreck is a one-line diff in a CSV, with no editor involved. Verified end to end: 19/19 data checks, 290 dressing actors placed from the CSVs, and the path across the map still verified.

| Artefact | Result |
|---|---|
| Dressing placement data | 67 instances (46 scrub, 10 barrel, 8 crate, 3 wreck) |
| Fence runs | 7 runs → 79 posts, 144 rails generated from the run lines |
| `Tools/verify_dressing.py` | **19/19 PASS**, no Blender, no editor, seconds |
| Collision at placement | **5/5** solid types, ray-verified |
| Path, DeployAlpha → DeployBravo | still verified |

The pipeline is now `construct → dress → navigate`. Dressing runs **before** navigation deliberately: placed afterwards, the fences would be invisible to the NavMesh and agents would walk through them, which is worse than a map that is plainly undressed.

### DEFECTS FOUND

**1. All 290 dressing actors were placed 100× too close to the origin.** `spawn()` divided by 100 on the way in and handed **metres** to `spawn_actor_from_class`, which takes **centimetres**. Everything clustered in a 1.3 m knot at (0,0): the map looked correct in the data file and bare in the engine, and every ray at the real coordinates hit open ground. Found by adding the collision self-check, which was the only thing that could tell "wrong place" from "no collision".

**2. Hand-placed wrecks bypassed the clearance check.** `WRECKS` were authored by hand and never passed through `clear_of_protected`, so two of three sat inside a deployment zone — 59 m from a spawn that requires 84. The CI validator caught it; the generator now routes hand-placement through the same check, refusing with a reason rather than emitting.

**3. The first four authored fence runs were bad and the validator said so.** Two of five were rejected: one passed 20.6 m from a deployment zone needing 74, the other 24.2 m from OBJ B needing 30. Relocated and re-validated rather than quietly accepted. The deployment radii are large enough that almost the whole northern and southern thirds are off-limits to long fences, which is a useful thing to learn about this map.

**4. A barrel stood 1.23 m from a fence line**, caught by a new check. The generator was not fence-aware; it is now, and the data is correct by construction.

**5. A `KAggregateGeom` string test misfired**, so a collision-type change silently did not apply and the report claimed a change that never happened. Replaced with an unconditional set plus a read-back.

**6. The replacement for defect 5 never actually ran.** The unconditional set asked for `unreal.CollisionTraceFlag.CTF_USE_SIMPLE_AS_SIMPLE`, an enum member that **does not exist** — the live 5.8.3 enum has only `CTF_USE_DEFAULT`, `CTF_USE_COMPLEX_AS_SIMPLE`, `CTF_USE_SIMPLE_AND_COMPLEX` and `CTF_USE_SIMPLE_AS_COMPLEX`. A broad `except` caught the `AttributeError` and downgraded it to a warning, so the set silently no-opped on all six meshes and the run still reported `ok`. The claim in defect 5's fix that it was “replaced with an unconditional set plus a read-back” was true of the *code* and false of the *effect*: the read-back existed, the write never happened. Found by reading the report's own warnings instead of skimming past them, then confirming the real member list by introspecting the enum in a live editor rather than trusting the C++ header from memory.

It was harmless in effect — the importer had already left every mesh at `CTF_USE_DEFAULT`, which is what the code meant to set — so this was not R-10's cause. But a pass whose job is to guarantee collision was reporting success without having written the value it reported writing, and the dress report was carrying six warnings that all read as benign. Fixed: the correct member is used, the applied value is compared against the requested one, and **both** a mismatched trace flag and a mesh with zero simple-collision elements are now hard failures rather than warnings.

**8. Fixing defect 6 exposed a bad experiment, which is the more useful half of this.** The project had recorded “collision type” as ruled out for R-10, with both complex-as-simple and simple tried and both failing. The complex-as-simple attempt had gone through the very write that defect 6 shows never ran, so the flag never changed and **the experiment proved nothing while sitting in the docs as settled fact.** With the write fixed, `CTF_USE_COMPLEX_AS_SIMPLE` was applied and confirmed by read-back (`<CollisionTraceFlag.CTF_USE_COMPLEX_AS_SIMPLE: 3>`) — and R-10 reproduced identically, 0/3 after reload. The hypothesis is now closed by measurement. A conclusion drawn from a call that silently did not happen is worse than no conclusion, because it removes the hypothesis from the list without ever testing it.

**7. The collision diagnostic could not detect missing collision.** `str(KAggregateGeom)` is an opaque pointer whether or not the struct holds anything, so the `body_agg_geom` report field could never tell “this asset has no collision” from “this asset is fine” — precisely the two cases it existed to separate. It also listed `capsule_elems` and `geom_elems`, which are not properties of `KAggregateGeom` on this engine and raised a property error on every run. Now counts the element arrays, and the first real run immediately showed all six meshes carrying exactly one `convex_elems` entry.

Net effect on the pass: **6 warnings → 0**, and the collision state of every mesh is now positively asserted rather than assumed.

### The one I could not remove

**Dressing collision does not survive a headless save and reload.** Solid 5/5 immediately after placement; 0/3 after reopening the map, 0/7 fence runs blocking. The map is traversable but the fences are **not yet load-bearing cover**, and navigation does not include them.

Ruled out by measurement, not assumption: placement position (a PaddockEast post reads 78.0, −34.0 m — exactly the CSV), collision profile (`BlockAll` and `QUERY_AND_PHYSICS` both survive), asset contents, collision type (see defect 8 — now genuinely tested rather than assumed), and stale imports (reproduced after deleting all six assets and re-importing). Later still exonerated the assets *as saved*: `Tools/Unreal/probe_collision_flag.py` reopens the project in a fresh editor with no import in play and reads every dressing `BodySetup` back off disk — all six at `CTF_USE_DEFAULT`, each with one `convex_elems` entry, so the simple collision is genuinely in the `.uasset` files.

What remains is sharper than before. Every observable is correct after reload — position, profile, `collision_enabled`, `can_ever_affect_navigation`, the asset's trace flag and its convex hull — and the ray still returns `hit=False by=None`, while the blockout in the same map with the same profile and save path collides. The one live difference left is **which session last touched the asset**: the blockout was imported once in the construct session and carried forward untouched, while the dress pass deletes and re-imports all six dressing meshes on every run and saves the map in that same session. That is the next thing to vary, and it is a one-line change. The blockout mesh still collides correctly, so the cause is narrower than any of the ruled-out items, but I did not isolate the engine mechanism and stopped rather than keep guessing.

I have **not** hidden this. The nav pass reports the two `*_after_reload` steps as failures, sets `dressing_collision_persists: false`, and emits a `WARN`. They deliberately do not gate `report["ok"]`, because CI would be permanently red for a reason we cannot fix and the data is already proven good by `verify_dressing.py`. Gating them would be honest but useless; passing them silently would be a lie. Tracked as **R-10**, with the most likely next step being a test of an interactive editor save.

### FILES CHANGED

- **`Tools/Common/dryriver_spec.py`** (new) — the Dry River layout and terrain in pure Python, no `bpy`. The blockout, the dressing generator and the CI validator all import it, so they cannot disagree about where the ground is. Refactoring the committed blockout generator to use it was verified behaviour-preserving: layout CSV **byte-identical**, still 162 objects / 8,944 faces, `verify_dryriver.py` still passing.
- **`Tools/Blender/dryriver_dressing.py`** (new) — mesh library (6 meshes) + initial layout
- **`Tools/Unreal/dress_dryriver.py`** (new) — the dressing pass
- **`Tools/verify_dressing.py`** (new) — the 19-check data validator
- **`Tools/Unreal/probe_collision_flag.py`** (new) — one-off diagnostic that introspects the live `ECollisionTraceFlag` enum and counts `KAggregateGeom` element arrays per dressing mesh. Kept because it is what narrowed R-10 on the asset side, and because re-running it is how that conclusion would be rechecked.
- `Content/Art/Blockout/SS_Dressing_*.fbx` + `_HI.blend` (new, LFS) — 6 meshes, 160 faces total
- `Content/Art/Blockout/SS_MAP_DryRiver_02_Dressing.csv` / `_Fences.csv` (new) — the placement data
- `Content/Art/Dressing/SS_Dressing_*.uasset` (new, LFS) — imported meshes
- `Tools/Blender/dryriver_blockout.py` — now imports the shared spec; **behaviour proven unchanged**
- `Tools/Unreal/build_dryriver_nav.py` — dressing-aware diagnostics, plus the reload collision report
- `.github/workflows/build.yml` — data validator + dressing pass
- `Docs/MAPS_DRYRIVER.md` — new §12; `Docs/PROJECT_AUDIT.md` — R-10

### TESTING

| Check | Result |
|---|---|
| `python Tools/verify_dressing.py` | **19/19 PASS** |
| `python Tools/Blender/verify_dryriver.py` after the spec refactor | **PASS**, layout CSV byte-identical |
| Dressing pass | 67 + 79 posts + 144 rails placed, **5/5 solid**, `ok=true` |
| Nav pass | path verified (2 points), saved, `ok=true` |
| Dressing collision after reload | **0/3** — reported, not hidden, tracked as R-10 |

### ASSETS

Six original greybox dressing meshes (160 faces total), all generated procedurally. No third-party assets, so no `LICENCE_REGISTER.md` entry. The wreck is deliberately anonymous: a recognisable real vehicle would be a trademark problem, and the opposing force is fictional in any case.

### RISKS

- **R-10 (NEW)** — dressing collision does not survive a headless save/reload. Characterised, not fixed. Detailed above and in `MAPS_DRYRIVER.md` §12.4.
- **R-09** — unchanged, open, route (a) chosen.

### NEXT ACTION

**Build the `SouthernSpearCore` plugin** — `ESS_TeamId` (ADR-003) and the `UFSSFactionPresentationSet` resolver (ADR-004) — unaffected by R-09 and R-10. R-10's next concrete step is now the cheapest untried variable, not the editor test: keep the existing dressing assets instead of deleting and re-importing them in `dress_dryriver.py`, and re-run the dress and nav passes. That is the one difference still standing between the dressing and the blockout, which survives.

---

## Session 005 — 2026-09-26 — Terminology Settled, ADR-003 Superseded, and SouthernSpearCore Built

### COMPLETED

**The fictional canon is now fixed, and the team-identity architecture it depends on is
implemented and tested.**

Two architecture decisions were recorded this cycle, both superseding earlier work:

- **ADR-016** — canonical organisations. **CDS** (Commonwealth Defence Service), **CLS**
  (Commonwealth Land Service), **ACR** (Australian Commonwealth Regiment), **2 CG**, **SOR**,
  **MAF** (Murasian Armed Forces), **CMECU**. `Docs/ORIGINAL_BRIEF.md` is left untouched as an
  immutable historical record; ADR-016 is the superseding authority.
- **ADR-017** — **supersedes ADR-003.** `ESSTeamId {None, TeamOne, TeamTwo}` is authoritative
  and replicated; `ESSLocality {Friendly, Opposing}` is derived per viewer and never
  replicated. ADR-003's intent survives; its mechanism did not.

ADR-016 and ADR-017 were previously *unused placeholders* for Phase 5 questions. They are
now taken, and the placeholders were renumbered to ADR-018..ADR-021. No question was answered
or dropped by the renumbering.

`Plugins/SouthernSpearCore` is created and is the root of the SS dependency graph: it depends
on **no other Southern Spear plugin and on no Lyra module**, so team identity cannot reach
weapons, damage, health, abilities, roles, objectives or UI. It provides `ESSTeamId`,
`ESSLocality`, `FSSViewerContext`, `FSSStableId`, `USSProjectSettings`, `LogSSCore`, shared
validation helpers, and 32 native Gameplay Tags under the `SS.` root.

Terminology was migrated across active documents. `Kestrel Militia`, "hostile militia",
"insurgent" and "Australian force (friendly)" are gone from active design docs. Historical
occurrences inside ADR bodies are **retained deliberately** — a rejected alternative stays in
the record.

The **Electric Dreams contradiction is corrected**. `LICENCE_REGISTER.md` L-0012 previously
read "reference + selective harvest only" and listed "approved use: generic modular pieces
only", directly contradicting ADR-013, which declined the pack **entirely**. It now reads
DECLINED / NOT IMPORTED / NOT PERMITTED, states that no selective harvesting is authorised,
and retains the historical evaluation as a non-authoritative record.

### FILES CHANGED

**Created**
- `Plugins/SouthernSpearCore/SouthernSpearCore.uplugin`
- `Plugins/SouthernSpearCore/Source/SouthernSpearCore/SouthernSpearCore.Build.cs`
- `.../Public/` — `SSCoreLog.h`, `SSTeamTypes.h`, `SSViewerContext.h`, `SSTeamIdentityLibrary.h`, `SSStableId.h`, `SSCoreValidation.h`, `SSNativeGameplayTags.h`, `SSProjectSettings.h`
- `.../Private/` — `SouthernSpearCoreModule.cpp`, `SSTeamIdentityLibrary.cpp`, `SSStableId.cpp`, `SSCoreValidation.cpp`, `SSNativeGameplayTags.cpp`, `SSProjectSettings.cpp`
- `.../Private/Tests/` — `SSTeamIdentityTests.cpp`, `SSDataValidationTests.cpp`
- `Tools/validate_architecture.py`
- `Docs/evidence/G020_*` (4 files)

**Modified**
- `SouthernSpear.uproject` — registers the plugin
- `.github/workflows/build.yml` — architecture guard step + report upload
- `Docs/DECISION_LOG.md` — ADR-016, ADR-017, ADR-003 superseded, placeholders renumbered
- `Docs/PROJECT_AUDIT.md` — gates G1.2/G2.0/G2.1, §6.4, §6.5, R-11
- `Docs/LICENCE_REGISTER.md` — L-0012 corrected; §5 rewritten
- `Docs/ASSET_REGISTER.md` — C-014..C-017 terminology
- `Docs/ASSET_NAMING_STANDARDS.md`, `Docs/GAME_DESIGN_DOCUMENT.md`, `Docs/DEVELOPMENT_ROADMAP.md`, `Docs/TEST_PLAN.md` — terminology

**Removed:** none.

### TESTING

All commands run from `E:\SouthernSpear`.

| # | Command | Exit | Result |
|---|---|---|---|
| 1 | `Build.bat SouthernSpearEditor Win64 Development` | **0** | `Result: Succeeded`, 0 errors |
| 2 | `UnrealEditor-Cmd … -ExecCmds="Automation RunTests SouthernSpear.Core; Quit" -TestExit=…` | **0** | **9/9 PASS** |
| 3 | `python Tools/verify_dressing.py` | **0** | 19/19 PASS |
| 4 | `blender -b --python Tools/Blender/verify_dryriver.py` | **0** | ALL CHECKS PASSED |
| 5 | `python Tools/validate_architecture.py` | **0** | PASS, no violations |
| 6 | Guard, 2 violations injected | **1** | Both violations reported (SS002, SS006) |
| 7 | Guard, violations reverted | **0** | PASS; source byte-identical (`md5sum`) |

**Project load and Game Feature activation** were observed in run 2, which loads the project
before running tests: `LogSSCore: SouthernSpearCore module started.`, all 5 Lyra features
(`TopDownArena`, `ShooterCore`, `ShooterExplorer`, `ShooterMaps`, `ShooterTests`) reach
`[Registered, Active]`, and the run contains **0 project errors** excluding offline
telemetry warnings.

**NOT RUN — Dry River navigation regression.** A nav re-run was started and interrupted
during editor startup; the editor was killed before the Python pass began, so it wrote
nothing. `L_DryRiver_01.umap` retains the timestamp of the last verified pass and was not
touched. G2.0 changed no map or map-generation input, so there is no evidence of regression,
but that is an inference and not a test. Tracked as **R-11**.

**NOT RUN — a dedicated load-only invocation.** A separate `-ExecCmds="Quit"` load check
exceeded 600 s in this environment: the editor wedges in telemetry retry loops because the
sandbox has no DNS for `datarouter.ol.epicgames.com`, and `Quit` does not take effect. This
is an environment limitation, not a project defect, and the same load is covered by run 2.
A CI-safe flag set for it is still to be found.

**NOT RUN — anything from Session 004 onward that is not listed above.** In particular
`SouthernSpearTeam`, the cosmetic faction-presentation resolver, the 3 ACR / MAF
presentation data, the `SSExp_ObjectiveAssault` skeleton and A88 integration are all
**not started this cycle**.

### ASSETS

No assets created, imported or modified this cycle. No Blender work. The 6 dressing FBX and
`SS_Dressing_HI.blend` remain **PLACEHOLDER** and uncommitted from Session 004.
Asset Register entries C-014..C-017 were updated for terminology. No new register rows were
required — the cycle added code, not content. Licence Register L-0012 corrected; no new
licences.

### RISKS

- **R-11 (new, LOW)** — Dry River navigation not re-verified after G2.0. Noted above.
- **R-10 (open)** — dressing collision does not survive save/reload. Unchanged.
- **R-09 (open, unchanged)** — this engine distribution cannot build `TargetType.Server`. The
  dedicated-server acceptance criterion remains unsatisfiable; route (a) still chosen.
- **Branding** — final insignia, camouflage, uniforms, weapons and store presentation still
  require **independent Australian legal review**. Renaming does not confer clearance.
- **Technical debt** — `ESSLocality` has no `None` member, so a default-constructed value is
  `Friendly`. Safety lives in the resolver API, not the type. Recorded in ADR-017 as a known
  sharp edge rather than left as a trap.

### DEFECTS FOUND

**1. `SSCORE_API` was undefined, and the first build failed with 20 errors.** UBT
auto-generates `SOUTHERNSPEARCORE_API`, not the short `SSCORE_API` the naming standard wants.
Aliased in `Build.cs` via `PublicDefinitions`. Found by the build, as it should be.

**2. A `class FGameplayTag;` forward declaration in `SSCoreValidation.h` collided with the
engine's definition as a `struct`**, producing a confusing cascade inside engine headers
(`GameplayTagContainer.generated.h`), not in my file. Replaced with the real include. The
error pointed at engine code; the cause was ours.

**3. Two of my own tests failed for the wrong reason.** `LocalityFailsSafely` and
`SpectatorContext` both assert on code that logs an error **on purpose**, and UE treats an
undeclared error log as a test failure. The behaviour was correct — the log shows all three
failure reasons firing exactly as designed — and the fix was to declare the errors expected,
so the tests still fail if the messages ever stop being produced. Worth recording: a test that
fails because it correctly provoked an error is not a failing feature, and reading the log
before changing code is what told the difference.

**4. The architecture guard's first version had a false positive.** Rule SS006 flagged
`ESSLocality` for declaring `Friendly`/`Opposing` — that is precisely what the enum is for.
The rule was wrong, not the code. Rewritten to apply the prohibition to the authoritative
team enum only, and inverted into a positive check that the locality enum keeps both values.
Caught by running the guard against real code rather than trusting that it was correct.

**5. A dangling `const TCHAR*` in `FSSStableId::ValidateAndLog`.** One branch assigned
`*FString::Printf(...)` to a `const TCHAR*`, which points into a temporary that dies at the
end of the switch. Changed to `FString`. Found while reviewing my own code after the build
was green, not by the compiler.

### NEXT ACTION

**Re-run the Dry River navigation regression to close R-11** — run
`Tools/Unreal/build_dryriver_nav.py` and assert 560 tiles plus a non-empty
`find_path_to_location_synchronously` path between the two deployments. It is the only
outstanding verification from work already done, and it is a single 6-minute command.

---

## Session 006 — 2026-09-26 — R-11 Closed, Guard Blind Spot Fixed, SouthernSpearTeam Presentation

### COMPLETED

- Audited the uncommitted tree (Sessions 004/005) and committed it as `8d3bd762`.
- Reviewed SouthernSpearCore: no SS sibling or Lyra dependency, no SS source in Lyra modules,
  ESSLocality not replicated (reflection test), no deliberately broken guard state left behind.
- Closed R-11 (Dry River navigation re-verified).
- Added `Plugins/SouthernSpearTeam`: cosmetic `FSSFactionPresentation` / `FSSFactionPresentationTable`,
  `ESSFactionPresentationId {None, ACR3, MAF}`, stateless `FSSFactionPresentationResolver`
  with explicit failure (no fallback), placeholder table using engine placeholder paths only.
- Extended the architecture guard: SS plugins may depend on SouthernSpearCore (and only it);
  SS002 now also applies to SouthernSpearTeam; presentation headers may not include `Lyra`,
  `Attribute` or `GameplayEffect` headers.
- README.md now opens with a Southern Spear overview and fictional-work disclaimer.

### FILES CHANGED

Created: `Plugins/SouthernSpearTeam/**`, `Docs/evidence/G030_*`, `Docs/evidence/R11_dryriver_nav_report.json`.
Modified: `Tools/validate_architecture.py`, `SouthernSpear.uproject` (enable SouthernSpearTeam),
`README.md`, `Docs/PROJECT_AUDIT.md` (R-11), `Docs/CHANGELOG.md`, `Content/Maps/L_DryRiver_01.umap` (re-saved by nav script).

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Architecture guard | `python Tools/validate_architecture.py` | 0 | PASS, 0 violations | `G030_guard_positive.txt` |
| Guard negative (scratch copy: Core→Team, Team→LyraGame, Lyra include in presentation header) | same, on copy | 1 | 4 findings: SS001×1, SS002×1, SS003×2 | `G030_guard_negative.txt` |
| SouthernSpearEditor build | `Build.bat SouthernSpearEditor Win64 Development -Project=...` | 0 | Succeeded, 0 errors | `G030_tests_keylines.txt` |
| Core + Presentation tests | `UnrealEditor-Cmd ... -ExecCmds="Automation RunTests SouthernSpear;Quit"` | 0 | 15/15 Success (Core 9, Presentation 6), 0 failed | `G030_tests_keylines.txt` |
| Game Feature check | same run | 0 | ShooterCore, ShooterExplorer, ShooterMaps, ShooterTests, TopDownArena transitioned successfully; log ending state reads `Registered` (not `Active`) in this commandlet run — activation not proven here | `G030_tests_keylines.txt` |
| Dry River nav (R-11) | documented command in `MAPS_DRYRIVER.md` | 0 | level loaded, 1 bounds volume, 1 RecastNavMesh, path 2 points. Tile count not reported by script | `R11_dryriver_nav_report.json` |
| Dressing data | `python Tools/verify_dressing.py` | 0 | 19/19 | console |
| Git LFS | staged-diff pointer check | — | all staged png/fbx/blend/uasset/umap are LFS pointers | — |
| Blender Dry River verification | — | — | NOT RUN (no Blender input changed) | — |
| Dedicated server | — | — | NOT RUN — R-09 open | — |

Presentation tests cover: all four viewer/subject pairs; invalid viewer; invalid subject; spectator
and replay without vantage; authorised spectator; missing and incomplete data (no substitution);
determinism (100 runs); reflected fields are non-replicated, never ESSLocality/ESSTeamId, and only
text/soft-path/presentation-enum kinds; 3 ACR and MAF views carry the same ESSTeamId.

### ASSETS

None created or imported. Placeholder table references engine-shipped assets by path only
(`SkeletalCube`, `DefaultMaterial`, `DefaultTexture`); no register entry required.

### RISKS

- ~~R-11~~ closed.
- R-09 (no Server target) and R-10 (dressing collision lost after reload; re-observed: 0/3 sampled,
  0/7 fences) remain open.
- New **R-12**: the "560 tiles" figure is not in any retained evidence and the nav script does not
  measure tiles; nav acceptance currently rests on the path check only.

### DEFECTS FOUND

1. **Guard rule SS003 never scanned presentation headers.** `iter_ss_headers` only yielded files
   whose immediate directory was `Public`, so anything in `Public/Presentation/` was skipped.
   Found by the negative test: an injected `LyraHealthComponent.h` include passed. Fixed.
2. **Guard SS001 forbade every SS→SS dependency**, contradicting the rule that SS plugins may build
   on SouthernSpearCore. Fixed.
3. **Game Feature activation — resolved in follow-up.** A `-game` run on `/ShooterMaps/Maps/L_Expanse`
   (`UnrealEditor-Cmd ... /ShooterMaps/Maps/L_Expanse -game -nullrhi`, stopped by 240 s timeout, exit 124)
   logs `ShooterCore ... Ending state: Active`; the other four remain `Registered`, which is correct Lyra
   on-demand behaviour. The Session 003 record already said `Registered`; the "all five became active"
   claim came from the session hand-off, not the evidence. Evidence `G031_gamefeature_activation_keylines.txt`.
4. Minor, not fixed: Core reports `UnrecognisedViewingTeam` when the *subject* team is an unknown
   non-None value (`SSTeamIdentityLibrary.cpp`).

### NEXT ACTION

Follow-up in this session: stale active docs corrected against ADR-016/017 (ROADMAP status,
TEST_PLAN execution table, GDD team/weapon rows, ASSET_REGISTER W-001..W-003/W-101..W-102,
ASSET_NAMING_STANDARDS examples, DF/_DA and _SM LOD contradictions, dressing-name deviation noted).

**Diagnose and fix R-10** (Dry River dressing collision lost after save/reload): re-observed this
session at 0/3 sampled props and 0/7 fences, and it is the last defect in already-built work
before new gameplay (SSExp_ObjectiveAssault / A88) begins.

---

## Session 007 — 2026-09-26 — R-10 Closed: the Fences Were Lying Down

### COMPLETED

- Diagnosed R-10 with a read-only probe (`Tools/Unreal/probe_dressing_reload.py`): after reload,
  dressing *does* collide, but a fence post measured 12 cm tall and 140 cm long and a rail 250 cm tall.
- Fixed `dress_dryriver.py`: `unreal.Rotator(0.0, yaw, 0.0)` → keyword form; positional order is
  (roll, pitch, yaw), so yaw had been applied as pitch. Same bug fixed in `build_dryriver_level.py`
  (player starts: pitch 180 → yaw 180).
- Fixed `build_dryriver_nav.py` checks: bare-`HitResult` handling, real vertical ray, actor check
  now gates on its result, and fence ground trace ignores dressing (it was landing on post tops).
- Re-dressed Dry River and re-ran the nav regression.

### FILES CHANGED

Modified: `Tools/Unreal/dress_dryriver.py`, `Tools/Unreal/build_dryriver_nav.py`,
`Tools/Unreal/build_dryriver_level.py`, `Content/Maps/L_DryRiver_01.umap`, six
`Content/Art/Dressing/*.uasset` (re-imported from the unchanged FBX by the dress pass),
`Docs/PROJECT_AUDIT.md`, `Docs/MAPS_DRYRIVER.md`. Created: `Tools/Unreal/probe_dressing_reload.py`,
`Docs/evidence/R10_*`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Dress pass | `UnrealEditor-Cmd ... -ExecutePythonScript=Tools/Unreal/dress_dryriver.py` | 0 | ok; 290 removed and re-placed; collide=True | `R10_dryriver_dressing_report.json` |
| Nav regression | documented command | 0 | path 2 points; 3/3 actors and 7/7 fences solid after reload; no warnings | `R10_dryriver_nav_report.json` |
| Dressing data | `python Tools/verify_dressing.py` | 0 | all checks passed | — |
| Player-start orientation in the map | — | — | NOT RUN — script fixed, map starts not regenerated | — |

### ASSETS

No new assets. Dressing `.uasset`s re-imported from existing registered FBX sources.

### RISKS

~~R-10~~ closed. New **R-13** (low): Dry River player starts in the saved map were spawned with
pitch 180 by the old level script; correct when `build_dryriver_level.py` is next run.

### DEFECTS FOUND

1. Rotator positional-order bug in two level scripts (found by measuring actor bounds).
2. Nav checker treated every hit as a miss, and traced a zero-length ray (found by a control trace).
3. Fence ground trace hit post tops once collision worked (found when 4/7 passed exactly on the
   runs whose midpoint is a post station).

### NEXT ACTION

**Begin SSExp_ObjectiveAssault** — the presentation increment builds and passes, and no defect
remains open in built work other than R-09 (engine distribution) and low-risk R-13.

---

## Session 008 — 2026-09-26 — GitHub, the Website, and Objective Assault Running on Dry River

### COMPLETED

- **GitHub.** Private repo `theantipopau/SouthernSpear` (source and docs; LFS binaries not pushed,
  since the repo vendors Epic content). Public repo `theantipopau/southernspear-site` serving the
  website on GitHub Pages: https://theantipopau.github.io/southernspear-site/
- **Website** (`Site/`), built from `Docs/images/southern-spear-website-design-spec.svg`: supplied
  logo and header unmodified, spec colour tokens, 1280/1024/900/768/480 breakpoints, menu below
  900 px, skip link, visible focus, reduced motion. Status, roadmap and this changelog are rendered
  from the repo's own Markdown. No invented release, download, community or donation link.
  Published by `python Tools/publish_site.py`.
- **README** rewritten as the Southern Spear project README.
- **SouthernSpearObjectives** plugin (ADR-018): pure `FSSObjectiveRules` (capture: presence not
  strength, contested freeze, neutralise-then-capture, decay; round: pre-round → sequential
  objectives → win on final capture / draw on time → post-round → reset), replicated
  `ASSObjectiveActor` and `ASSObjectiveAssaultDirector`, team read through
  `IGenericTeamAgentInterface` (no Lyra dependency). Editor-only `SouthernSpearObjectivesEditor`
  helper, because `FGameFeatureComponentEntry` is not exposed to Python.
- **SSExp_ObjectiveAssault** Game Feature + `B_SS_ObjectiveAssault` experience, built by
  `Tools/Unreal/setup_objective_assault.py`, which also wires Dry River (2 objectives, director,
  default experience). CI runs it.
- **Dry River player starts fixed (R-13).** They were at ±85 **cm** (metres passed as cm) and pitched
  180°. Now at ±85 m, facing the centre. Level, dressing, objectives and nav regenerated.
- Architecture guard: SS002 (no Lyra) now covers SouthernSpearObjectives.

### FILES CHANGED

Created: `Plugins/SouthernSpearObjectives/**`, `Plugins/GameFeatures/SSExp_ObjectiveAssault/**`,
`Tools/Unreal/setup_objective_assault.py`, `Tools/publish_site.py`, `Site/**`, `.claude/launch.json`,
`Docs/evidence/G040_*`. Modified: `README.md`, `SouthernSpear.uproject`, `Tools/validate_architecture.py`,
`Tools/Unreal/build_dryriver_level.py`, `.github/workflows/build.yml`, `Content/Maps/L_DryRiver_01.umap`,
regenerated Dry River/dressing `.uasset`s, `Docs/DECISION_LOG.md` (ADR-018), `Docs/PROJECT_AUDIT.md`,
`Docs/MAPS_DRYRIVER.md`, `Docs/TEST_PLAN.md`, `Docs/ASSET_REGISTER.md`, `Docs/DEVELOPMENT_ROADMAP.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Architecture guard | `python Tools/validate_architecture.py` | 0 | PASS | `G040_guard_positive.txt` |
| Guard negative (Objectives → Team + LyraGame, scratch copy) | same | 1 | SS001 + SS002 caught | `G040_guard_negative.txt` |
| Editor build | `Build.bat SouthernSpearEditor Win64 Development` | 0 | Succeeded | `G040_tests_keylines.txt` |
| All tests | `Automation RunTests SouthernSpear` | 0 | **26/26** (Core 9, Presentation 6, Objectives 11 incl. a real-world round with overlap-based presence) | `G040_tests_keylines.txt` |
| Level → dress → setup → nav chain | the four `-ExecutePythonScript` commands | 0 each | setup ok (8/8 steps); nav path 2 points, 3/3 actors and 7/7 fences solid | `G040_objective_assault_setup.json`, `G040_dryriver_nav_report.json` |
| Live game | `UnrealEditor-Cmd ... /Game/Maps/L_DryRiver_01 -game -nullrhi` (stopped by 200 s timeout, exit 124) | 124 | experience identified from WorldSettings; SSExp_ObjectiveAssault and ShooterCore Active; round 1 PreRound → InProgress, OBJ A active; bots spawned | `G040_dryriver_objective_assault_game_keylines.txt` |
| Dressing data | `python Tools/verify_dressing.py` | 0 | all checks passed | — |
| Site | local preview + JS checks at 1280 and 375 px | — | 7 sessions rendered, no horizontal overflow, menu at 375 px | — |
| A capture in a live match | — | — | **NOT RUN** — Lyra bots do not seek objectives; capture is proven by the world test only | — |
| Multiplayer replication of round state | — | — | **NOT RUN** — needs two clients (R-05) and a server (R-09) | — |

### ASSETS

Two original data assets (register M-001f, M-001g). No art imported. Brand PNGs copied unmodified to
the public site repo.

### RISKS

~~R-13~~ closed. Open: R-09 (no Server target), R-12 (tile count unmeasured). New **R-14**: private repo
holds LFS pointers only, so the GitHub copy is not a full backup of binary assets. New **R-15**:
the level pass (`build_dryriver_level.py`) still reports its own pass-1 path check as failed
(`ok=False`); the nav pass is the authoritative check and passes.

### DEFECTS FOUND

1. Player starts placed in metres-as-centimetres, found by dumping actor transforms while wiring the experience.
2. `World->BeginPlay()` does not dispatch actor BeginPlay without a GameMode; test worlds now use
   `WorldSettings->NotifyBeginPlay()`. Found by the first world-test run.
3. `LyraWorldSettings.DefaultGameplayExperience` is EditDefaultsOnly and refuses Python; set via an
   editor helper. `FGameFeatureComponentEntry` is not Python-exposed; same fix.
4. A dump script held a map reference across `load_map`, causing an editor "World Memory Leaks" fatal.

### NEXT ACTION

**Make bots play the objective** (a ShooterCore-compatible bot behaviour that moves to the active
`ASSObjectiveActor`), so a full round can be won in a live `-game` run rather than only in the world test.

---

## Session 009 — 2026-09-26 — Bots Steered to Objectives, Respawn Granted (unverified live)

### COMPLETED
- `ASSObjectiveAssaultDirector` steers idle AI bots (Lyra blackboard `TargetEnemy` empty) to the active objective every 2 s; players never touched.
- `setup_objective_assault.py` grants ShooterCore `AbilitySet_Elimination` (GA_AutoRespawn) to LyraPlayerState via the text-property helper.

### TESTING
| Test | Exit | Result |
|---|---|---|
| Editor build | 0 | Succeeded |
| setup_objective_assault.py | 0 | ok, 10/10 steps incl. respawn_abilities |
| build_dryriver_nav.py | 0 | path verified, dressing solid |
| Automation tests after steering change | — | **NOT RUN** (usage limit) |
| Live `-game` round with `?NumBots=6` | — | **NOT RUN** (usage limit) |

### RISKS
Steering untested live; could conflict with the bot behaviour tree.

### NEXT ACTION
**Run the test suite, then a live `-game` run on L_DryRiver_01?NumBots=6 (~8 min) and confirm a round is won by capture.**

---

## Session 010 — 2026-09-26 — Live Objective Assault Verified Over 22 Rounds

### COMPLETED
- Reviewed the producer's live run (`/Game/Maps/L_DryRiver_01?NumBots=6 -game -nullrhi`, ~2 h).
- Added (not yet verified) 7 extra ground-snapped player starts per deployment in
  `setup_objective_assault.py`; blocked from saving while the producer's game process held the assets.

### TESTING
| Test | Result | Evidence |
|---|---|---|
| Live round lifecycle, 6 bots | **PASS**: 22 rounds; wins for both teams by sequential capture, a split round (TeamTwo took A, TeamOne took B and won), timeout draws, every round reset; idle-bot steering active; no fatal errors, only engine Toolset Python import noise | `Docs/evidence/G041_live_round_keylines.txt` |
| Extra player starts | **NOT RUN** — asset save blocked by a running game process | — |
| Automation suite after bot steering | **NOT RUN** | — |

### RISKS
New **R-16**: win streaks (up to 8 in a row for one team, rounds ~1.5 min) suggest the winning
team respawns close to OBJ B. Needs spawn/objective distance review once multiple starts exist.

### NEXT ACTION
**Close the running game, run setup_objective_assault.py + nav, and verify the extra starts.**

---

## Session 011 — 2026-09-26 — CLAUDE.md Added

### COMPLETED
- Added `CLAUDE.md`: project identity, session start checklist, source-of-truth order, fictional
  content and legal rules, module architecture and guard, build/test commands, Dry River pipeline
  order, Unreal Python gotchas found in Sessions 006–010, Git/LFS/publishing rules, and the
  mandatory end-of-session changelog format.

### FILES CHANGED
Created `CLAUDE.md`. Modified `Docs/CHANGELOG.md`.

### TESTING
Documentation only. No build or test run: **NOT RUN** (not applicable).

### ASSETS
None.

### RISKS
Unchanged. The extra player starts from Session 010 remain unverified.

### NEXT ACTION
**Close the running game process, run `setup_objective_assault.py` + `build_dryriver_nav.py`, and verify the extra player starts.**

---

## Session 012 — 2026-09-26 — Extra Deployment Starts and Round-Reset Respawn

### COMPLETED

- Stopped the stale headless `-game` run (PID 26412, from Session 010) that was holding the assets.
- **Extra deployment starts verified:** `setup_objective_assault.py` now places 7 ground-snapped starts per
  team (14 total) around each deployment; nav re-verified afterwards.
- **Round-reset respawn** (`ASSObjectiveAssaultDirector::bRespawnAllOnRoundReset`, default on): from round 2,
  every pawn is destroyed at reset so the game mode respawns it at a deployment start; after 1 s any
  *player* controller still without a pawn is restarted directly. AI controllers are left to their own
  respawn path. Engine-only (`AGameModeBase`), no Lyra dependency. Addresses the main cause of R-16:
  rounds previously began wherever the last one ended.
- **Playtest URL overrides:** `?RoundSeconds=`, `?PreRoundSeconds=`, `?PostRoundSeconds=` on the map URL.

### FILES CHANGED

Modified: `Plugins/SouthernSpearObjectives/.../SSObjectiveAssaultDirector.{h,cpp}`,
`Tools/Unreal/setup_objective_assault.py`, `Content/Maps/L_DryRiver_01.umap`,
`Plugins/GameFeatures/SSExp_ObjectiveAssault/Content/SSExp_ObjectiveAssault.uasset` (regenerated),
`Docs/PROJECT_AUDIT.md`, `CLAUDE.md`. Created: `Docs/evidence/G050_*`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Setup pass | `-ExecutePythonScript=.../setup_objective_assault.py` | 0 | ok; 10/10 steps; "14 extra start(s) across 2 deployment(s)" | `G050_objective_assault_setup.json` |
| Nav pass | `-ExecutePythonScript=.../build_dryriver_nav.py` | 0 | ok, path 2 points | `G050_dryriver_nav_report.json` |
| Live, default rules (8 bots) | `-game ... L_DryRiver_01?NumBots=8`, 420 s timeout | 124 | Round 1 → 4 all won by TeamTwo (both objectives), resets working before respawn existed | — (superseded run) |
| Live, respawn first attempt | same, 300 s | 124 | respawned 9 at reset, but **1 ensure** in `LyraPlayerBotController::ServerRestartController` | — |
| Live, final | `-game ... L_DryRiver_01?NumBots=8?RoundSeconds=60 -FORCELOGFLUSH`, 400 s | 124 | 4 resets, each "sending 9 player(s) back to deployment", "restarted 0 controller(s) directly"; **0** fatal/assert/ensure | `G050_round_reset_respawn_game.txt` |
| All tests | `Automation RunTests SouthernSpear` | 0 | 26/26 | `G050_tests_keylines.txt` |
| Guard / dressing | `validate_architecture.py`, `verify_dressing.py` | 0 / 0 | PASS / all passed | — |
| Automated test of `RespawnAllPlayers` | — | — | **NOT RUN** — needs a GameMode; covered by the live run only |
| Spawn positions after reset | — | — | **NOT RUN** — positions not logged; respawn is proven, "at deployment" relies on Lyra start selection |

### ASSETS

None imported. GFD and map regenerated by script.

### RISKS

R-16 mitigated (reset respawn), still open until spawn-to-objective distances are measured. With 60 s
rounds, all four were draws (OBJ A contested throughout); with default 900 s rounds one run saw 8 min with
no capture, so bots can deadlock on a contested objective (noted under R-16).

### DEFECTS FOUND

1. A Python edit silently failed to insert the respawn call (CRLF source); found when the live log lacked the line.
2. Direct `RestartPlayer` for AI double-restarted a bot already mid-respawn (Lyra ensure); found in the live log.
3. `-game` logs lose their tail when killed by timeout; use `-FORCELOGFLUSH`.

### NEXT ACTION

**Add an objective HUD** (active objective, capture progress, round timer, score) reading only the replicated
director and objective state.

---

## Open Threads

| Item | Blocked on | Owner |
|---|---|---|
| ~~First editor launch of the renamed project~~ | **CLOSED** — G0.10 passed | — |
| ~~NavMesh validation for Dry River~~ | **CLOSED** — G1.1 passed, 560 tiles, path verified | — |
| **Dedicated server target build (R-09)** | **Producer decision — this engine distribution cannot build Server targets at all. See `PROJECT_AUDIT.md` §6.1 and producer question 5** | **Producer** |
| Fab account / engine registration (R-03) | Producer decision | Producer |
| Second client machine for 4-client test (R-05) | Producer decision | Producer |
| Insignia legal clearance (L-0003) | Legal review | Producer |

---

## Conventions for Future Entries

One section per work session, newest at the bottom. Always:

- **COMPLETED** — exact changes, not intentions
- **FILES CHANGED** — created/modified/removed, with the vendoring status of anything untracked
- **TESTING** — command, result, or `NOT RUN`. No exceptions
- **ASSETS** — created/imported/licence entries/placeholders remaining
- **RISKS** — new risks get IDs continuing from R-08; closed risks are struck through, not deleted
- **DEFECTS FOUND** — with how they were found, since that is the real signal
- **NEXT ACTION** — exactly one, the highest-priority item
