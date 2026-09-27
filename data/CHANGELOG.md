# CHANGELOG — Southern Spear

**Document ID:** `Docs/CHANGELOG.md`
**Purpose:** Rolling record of what was actually done, what was actually tested, and what is still open. Appended to at the end of every work session.
**Last updated:** 2026-09-27

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

## Session 013 — 2026-09-26 — Objective HUD and Dry River Lighting

### COMPLETED

- **Objective HUD** in a new UI module `SouthernSpearObjectivesUI` (Runtime, in the Objectives plugin):
  pure `FSSObjectiveHudModel` (round/clock, "OBJ B Farmstead (2/2) Opposing capturing", own-side-first
  score; viewer-relative words via the viewer's team, neutral "Team One/Team Two" when the viewer has no
  team — ADR-017), C++-built `USSObjectiveStatusWidget` (no asset), and `USSObjectiveHudSubsystem`, which
  adds it for the local player whenever a director exists. Reads replicated state only; changes nothing.
- The first version put UMG in the gameplay module; guard rule **SS005 caught it** and the UI was split out.
  Guard extended: a `<Module>UI` may depend on `<Module>` (SS001), `*UI` modules are exempt from SS005, and
  `SouthernSpearObjectivesUI` is on the SS002 no-Lyra list.
- `ASSObjectiveAssaultDirector::ToTeamId(FGenericTeamId)` exposes the director's team mapping.
- **Dry River lighting**: `Tools/Unreal/light_dryriver.py` (movable sun, sky atmosphere, real-time sky
  light, height fog, unbound post-process with bounded exposure). The map had no lights and rendered black.
  Added to CI and the pipeline docs (level → dress → **light** → setup → nav).

### FILES CHANGED

Created: `Plugins/SouthernSpearObjectives/Source/SouthernSpearObjectivesUI/**` (Build.cs, HUD model,
status widget, HUD subsystem, 3 tests), `Tools/Unreal/light_dryriver.py`, `Docs/evidence/G051_*`.
Modified: `SouthernSpearObjectives.uplugin`, `SSObjectiveAssaultDirector.{h,cpp}`, `Tools/validate_architecture.py`,
`.github/workflows/build.yml`, `Content/Maps/L_DryRiver_01.umap`, `CLAUDE.md`, `Docs/MAPS_DRYRIVER.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Guard (UMG in gameplay module) | `python Tools/validate_architecture.py` | 1 | SS005 flagged `SouthernSpearObjectives` → UMG (real catch, fixed) | — |
| Guard after split | same | 0 | PASS | — |
| Editor build | `Build.bat SouthernSpearEditor Win64 Development` | 0 | Succeeded | — |
| All tests | `Automation RunTests SouthernSpear` | 0 | **29/29** (new `Objectives.Hud.ViewerRelative`, `.NoViewerTeamIsNeutral`, `.Phases`) | `G051_tests_keylines.txt` |
| Lighting pass | `-ExecutePythonScript=.../light_dryriver.py` | 0 | ok, 5/5 actors, map saved | `G051_dryriver_lighting_report.json` |
| Nav after lighting | `build_dryriver_nav.py` | 0 | ok, path 2 points | — |
| Live `-nullrhi` (6 bots, 60 s rounds) | `-game ... -FORCELOGFLUSH`, 200 s | 124 | "Objective status widget shown for LyraPlayerController_0"; resets respawn 7; 0 fatal/assert/ensure | — |
| Rendered check | `UnrealEditor.exe ... -game -windowed 1280x720`, screen capture at 70 s | — | lit map; HUD shows round clock, active objective, capture bar (opposing red), score | `G051_hud_lit_dryriver.png` |
| HUD replication with a remote client | — | — | **NOT RUN** (R-05/R-09) | — |

### ASSETS

None imported. Map re-saved by the lighting and nav passes. Screenshot evidence contains Lyra placeholder
content (private repo, LFS pointer only).

### RISKS

No new risks. Open: R-09, R-12, R-14, R-15, R-16. The map is untextured blockout grey; Lyra placeholder
characters and weapons remain (the art-source decision is still the producer's).

### DEFECTS FOUND

1. UI dependency in the gameplay module — found by guard SS005 before commit.
2. Dry River had no lighting — found by the first rendered capture (black scene).
3. On-screen `WeaponAudioFunctions.EarlyReflections` errors — caused by `-nosound`; gone with sound on. Not a defect.

### NEXT ACTION

**Viewer-relative team tint**: colour the viewer's own team blue and the opposing team red on characters
(currently Lyra's fixed per-team colours, so the local player can be red), via SouthernSpearTeam presentation.

---

## Session 014 — 2026-09-26 — HUD Restyled to the Southern Spear Palette

### COMPLETED

- `SSUIStyle.h`: the website design tokens (`Site/styles.css`) mirrored in C++ (ink/field greens, line,
  brass, sand, sage, OPFOR clay). Friendly = sage, opposing = OPFOR clay, contested = brass, neutral = sage-400.
- Objective status widget rebuilt: field-dark plate with a brass top edge, ROUND n label (brass, tracked caps),
  phase + large clock (turns clay under 30 s), A/B objective chips (owner-tinted, active outlined in brass),
  objective name and viewer-relative status, a flat two-segment capture bar, own-side-first score.
- `FSSObjectiveHudModel` gained structured fields (round label, phase, clock, name, status, per-side
  words/scores/tones) and `BuildChips`. Spectators get neutral colours on both sides (ADR-017).

### FILES CHANGED

Created: `SouthernSpearObjectivesUI/Public/SSUIStyle.h`, `Docs/evidence/G052_*`. Modified:
`SSObjectiveHudModel.{h,cpp}`, `SSObjectiveStatusWidget.{h,cpp}`, `Tests/SSObjectiveHudTests.cpp`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Guard | `python Tools/validate_architecture.py` | 0 | PASS | — |
| Build | `Build.bat SouthernSpearEditor Win64 Development` | 0 | Succeeded (one fix: `Clock` field shadowed a helper) | — |
| All tests | `Automation RunTests SouthernSpear` | 0 | **30/30** (new `Objectives.Hud.Chips`) | `G052_tests_keylines.txt` |
| Rendered | windowed `-game`, game window captured at 80 s | — | palette HUD as described; chips, bar and score correct | `G052_hud_palette.png` |

### ASSETS

None. System font (Roboto) with letter spacing stands in for Barlow Condensed (would need an OFL font
import and a licence-register entry).

### RISKS

No new risks. Lyra's own HUD (health, ammo, weapon slots) is still Lyra's cyan style; restyling it means
replacing the experience's HUD layout, which needs Lyra attribute access from a UI module (same bridge
decision as the team tint).

### DEFECTS FOUND

1. The first capture attempt grabbed the desktop because the game window was behind another app; the
   capture now focuses the game window and captures only its rectangle. The stray image was deleted.

### NEXT ACTION

**Producer decision: Lyra bridge (modify Lyra's team display function, or add a SouthernSpearLyraBridge
module)**. It unblocks both the viewer-relative team tint and a Southern Spear health/ammo HUD.

---

## Session 015 — 2026-09-26 — Lyra Bridge and Viewer-Relative Team Tint

### COMPLETED

- Producer decisions recorded: **ADR-019** (SouthernSpearLyraBridge is the one guarded Lyra dependency) and
  **ADR-020** (original art, script-built in Blender).
- New plugin `SouthernSpearLyraBridge` with `USSViewerTeamTintSubsystem`: on each client, every pawn is
  tinted from the viewer's side (own team sage `#B9C1B4`, other team OPFOR clay `#8C493D`, glows from the
  palette) through `FSSTeamIdentity::ResolveLocality`. Spectators keep Lyra's absolute colours.
- Guard: SS002 now bars Lyra from **every** `SouthernSpear*` module except the bridge.
- Dev tool: `-SSShotAt=<s>` takes an in-engine viewport screenshot, replacing desktop capture.

### FILES CHANGED

Created: `Plugins/SouthernSpearLyraBridge/**`, `Docs/evidence/G053_viewer_relative_tint.png`. Modified:
`SouthernSpear.uproject`, `Tools/validate_architecture.py`, `SSObjectiveHudSubsystem.{h,cpp}`,
`Docs/DECISION_LOG.md`, `CLAUDE.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Guard | `python Tools/validate_architecture.py` | 0 | PASS | — |
| Guard negative (Team → LyraGame + LyraBridge, scratch copy) | same | 1 | SS001 + SS002 | — |
| Build | `Build.bat SouthernSpearEditor ...` | 0 | Succeeded | — |
| All tests | `Automation RunTests SouthernSpear` | 0 | 30/30 | — |
| Live `-nullrhi`, 6 bots | 120 s | 124 | "Viewer-relative tint applied to 7 pawn(s) (viewer TeamOne)"; 0 fatal/assert/ensure | — |
| Rendered | windowed `-game -SSShotAt=45` | 124 | own character sage (was Lyra red), opposing name tags clay; HUD intact | `G053_viewer_relative_tint.png` |
| Tint seen by a second (TeamTwo) client | — | — | **NOT RUN** (R-05/R-09) | — |

### ASSETS

None.

### RISKS

No new IDs. Two desktop screen captures grabbed other windows instead of the game; both were deleted,
never committed, and the practice was replaced by `-SSShotAt`.

### DEFECTS FOUND

1. `ULyraTeamDisplayAsset` is not exported from LyraGame (link-time); the bridge sets the colour parameters directly.
2. Focus-stealing capture opened Lyra's pause menu; the in-engine screenshot avoids it.

### NEXT ACTION

**A88 rifle, first pass**: a script-built Blender model (`Tools/Blender/a88_rifle.py`), imported and equipped
through a Southern Spear weapon definition that reuses Lyra's rifle behaviour and animations.

---

## Session 016 — 2026-09-26 — Sourced Asset Review and the A88 in Game

### COMPLETED

- **`Content/Sourced/` review** (about 2.4 GB, 286 files, added by the producer). No licences anywhere. It
  includes a *Call of Duty: MWIII* rip and a *Counter-Strike 2* rip, real-weapon replicas (AUG, HK416, AKM,
  M4, Minimi), an "insurgent" character (contradicts ADR-016), and scraped textures. Verdicts are in
  `Docs/SOURCED_ASSET_REVIEW.md`. The folder is git-ignored and **nothing was imported**. New risk R-17.
- **A88 rifle, first pass (ADR-020)**:
  - `Tools/Blender/a88_rifle.py` builds an original angular bullpup (89 cm, 2,632 tris, Polymer/Metal/Glass slots, muzzle socket).
  - `Tools/Unreal/setup_a88.py` imports it, adds the flat PBR master `M_SS_FlatPBR` and palette instances, and creates
    `B_SS_A88` on the new `ASSHeldItemVisualActor` (SouthernSpearTeam, cosmetic only).
  - It also creates `WID_SS_A88`/`ID_SS_A88` as copies of Lyra's rifle definitions, pointed at our visual.
- **Starting loadout** (`USSLoadoutSubsystem` + `USSLoadoutSettings` in the bridge): each pawn receives the
  configured items and the first becomes active, the same for both teams. Lyra's unexported quick bar is
  driven through UFUNCTION reflection. `ID_SS_A88` is configured in `DefaultGame.ini`.
- Editor helper `GetPropertyAsText` added.

### FILES CHANGED

Created: `Tools/Blender/a88_rifle.py`, `Tools/Unreal/setup_a88.py`, `Art/Weapons/A88/{SM_A88.fbx,A88.blend}`,
`SSHeldItemVisualActor.{h,cpp}`, `SSLoadoutSubsystem.{h,cpp}`, `/SSExp_ObjectiveAssault/Weapons/A88/*`,
`/SSExp_ObjectiveAssault/Materials/M_SS_FlatPBR`, `Docs/SOURCED_ASSET_REVIEW.md`, `Docs/evidence/G054_*`.
Modified: `.gitignore`, `Config/DefaultGame.ini`, `SouthernSpearLyraBridge.Build.cs`, the editor library,
`Docs/ASSET_REGISTER.md`, `Docs/PROJECT_AUDIT.md` (R-17), `CLAUDE.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Blender build | `blender --background --factory-startup --python Tools/Blender/a88_rifle.py` | 0 | ok, 0.89 × 0.084 × 0.313 m, 2,632 tris | `G054_a88_side.png`, `G054_a88_threequarter.png` |
| Unreal setup | `-ExecutePythonScript=.../setup_a88.py` | 0 | ok, 6/6 steps; mesh 89 cm; muzzle socket found; 1 equippable fragment re-pointed | `G054_a88_setup.json` |
| Guard / build / tests | as usual | 0/0/0 | PASS / Succeeded / 30/30 | — |
| Rendered | windowed `-game -SSShotAt=35`, 6 bots | 124 | A88 active in slot 2 (30/60), held correctly (rail and optic up, forward), bots carry it (kill feed); no Blueprint runtime errors | `G054_a88_in_game.png` |
| Muzzle flash / shell FX on the A88 | — | — | **NOT CHECKED** — Lyra's fire cue may expect `B_Weapon`; next pass | — |

### ASSETS

W-A88-01 (Class F, original). Nothing from `Content/Sourced/`.

### RISKS

New **R-17** (unlicensed drop in `Content/Sourced/`). The environment scans also conflict with ADR-013.

### DEFECTS FOUND

1. `StaticMesh.sockets` is protected in Python; `find_socket` is used instead.
2. The Lyra item-fragment property is invisible to Python; set via the text helper.
3. The local `CallFunction` helper collided with `UObject::CallFunction` (compile error), so it was renamed.

### NEXT ACTION

**A88 fire effects and first-person fit**: verify the muzzle flash, tracers and shell ejection on `B_SS_A88`
(add the sockets and interface Lyra's fire cue expects), and tune `MeshOffset` so the hands sit on the grip and foregrip.

---

## Session 017 — 2026-09-27 — Licensed-Art Policy, Sketchfab Clearance, A89

> The original entry reported the three cleared Sketchfab assets as L-0012 to L-0014. The current register uses L-0012 for Electric Dreams (declined), L-0013 Split Point, L-0014 Bingie Bingie and L-0015 Ross River; this numbering correction is recorded in the current rows, below. The initial asset drop count is historical; see `SOURCED_ASSET_REVIEW.md` for the later measured inventory.

### COMPLETED

- **ADFRC addon drop reviewed** (`Content/Sourced/ADF`, 1,681 files): no models (only `.paa`, `.rvmat`, configs and sounds),
  APL-SA/Arma-only licence, other authors, ADF-branded. Not usable; recorded in `SOURCED_ASSET_REVIEW.md`.
- **ADR-021** (producer decision): free/purchased Fab (Standard License) and CC0/CC-BY Sketchfab assets are
  allowed, registered before use and adapted to the fiction. Weapons stay original A-series; Dry River's layout stays original.
- **Sketchfab clearance** via the public API:
  - Cleared, CC-BY: Split Point VIC, Bingie Bingie NSW, Ross River NT (the original L-0012 to L-0014 shorthand was off by one; authoritative entries are now L-0013 to L-0015).
  - Rejected: Cape Liptrap (CC-BY-NC-ND).
  - Still needing page URLs: Petty Beach and the gear models.
- **A89 light support weapon**, original design (1.19 m, 2,012 tris): shared helpers in `Tools/Blender/ss_weapon_kit.py`.
  The Unreal import is generalised to `Tools/Unreal/setup_weapons.py` (`WEAPONS = ["A88", "A89"]`).
- Fab "Add to Project" help for the producer. The launcher doesn't list this project, so use the in-editor Fab plugin.

### FILES CHANGED

Created: `Tools/Blender/ss_weapon_kit.py`, `Tools/Blender/a89_support.py`, `Art/Weapons/A89/*`,
`/SSExp_ObjectiveAssault/Weapons/A89/*`, `Docs/evidence/G055_*`. Renamed: `Tools/Unreal/setup_a88.py` →
`setup_weapons.py`. Modified: `Docs/DECISION_LOG.md` (ADR-021), `Docs/LICENCE_REGISTER.md`,
`Docs/SOURCED_ASSET_REVIEW.md`, `CLAUDE.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Sketchfab licence lookup | `curl https://api.sketchfab.com/v3/search?...` | 0 | licences as listed above | `SOURCED_ASSET_REVIEW.md` |
| A89 build | `blender ... a89_support.py` | 0 | ok, 1.19 × 0.10 × 0.28 m, 2,012 tris | `G055_a89_*.png` |
| Weapons setup | `-ExecutePythonScript=.../setup_weapons.py` | 0 | ok, 12/12 steps (A88 + A89), both muzzle sockets | `G055_weapons_setup.json` |
| A89 in game | — | — | **NOT RUN** — not in the loadout yet (a support role needs role or kit selection first) | — |

### ASSETS

W-A89-01 (Class F, original). L-0013 to L-0015 cleared (CC-BY), not yet imported.

### RISKS

R-17 is narrowed: three scans cleared, one rejected; the rest await URLs.

### DEFECTS FOUND

1. The finishes check assumed every weapon has a Glass slot; it now compares against the mesh's own slots.

### NEXT ACTION

**Kit selection**: a simple per-player kit choice (Rifleman: A88; Support: A89) in the loadout settings, so the
A89 is playable and the A88 fire-effects pass can be verified on both weapons.

---

## Session 018 — 2026-09-27 — First-Person Camera; Fab Packs Arrive

### COMPLETED

- **First-person camera** (the game is an FPS; Lyra's ShooterCore is third-person). In `SouthernSpearLyraBridge`:
  - `USSFirstPersonCameraMode` puts the view at the `head` bone plus an offset, following control rotation (FOV 90).
  - `USSFirstPersonADSCameraMode` gives aim-down-sights at FOV 60.
  - `USSFirstPersonSubsystem` wraps Lyra's camera-mode delegate for the local player: Lyra's ADS choice maps to the
    SS ADS mode, everything else to SS first person. It also hides the local player's own head.
- Fab project listing fixed for the producer with a directory junction in `OneDrive/Documents/Unreal Projects`.
- Fab packs are now in `Content/`: AK-47, FPS_Weapon_Bundle, Insurgent_2, Modern_Insurgent_7, QuantumCharacter,
  M1911, RuralAustralia, and `Downloaded/`. All raw packs are git-ignored until adapted (ADR-021).

### FILES CHANGED

Created: `SSFirstPersonCameraMode.{h,cpp}`, `SSFirstPersonSubsystem.{h,cpp}`, `Docs/evidence/G056_first_person.png`.
Modified: `.gitignore`, `CLAUDE.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Build | `Build.bat SouthernSpearEditor ...` | 0 | Succeeded | — |
| Rendered | windowed `-game -SSShotAt=40` (a first attempt timed out while shaders compiled) | 124 | "First-person camera active"; eye-level view, HUD/ammo intact; **no arms or weapon in view** | `G056_first_person.png` |
| ADS in first person | — | — | **NOT RUN** (needs input) | — |
| Automation tests | — | — | **NOT RUN** this step (no test-covered code changed) | — |

### ASSETS

Fab packs present, not yet reviewed or registered.

### RISKS

New **R-18**: first person has no view model (arms and weapon) yet.

### DEFECTS FOUND

1. **Process defect:** commit `88627674` staged with `git add -A` and swept in two packs that arrived mid-commit
   (M1911: 31 files, RuralAustralia: 436), before they were ignored. Only LFS pointers were pushed, because pushes
   skip LFS uploads, so no asset data left the machine. Fixed in the next commit (untracked and ignored). From now
   on, commits stage explicit paths only (CLAUDE.md).
2. The changelog script failed on a `\U` escape in a Windows path; changelogs are now written from a file.

### NEXT ACTION

**First-person view model**: review FPS_Weapon_Bundle for first-person arms and animations, then show arms plus the
equipped A-series weapon to the local player only.

---

## Session 019 — 2026-09-27 — Red Gum Station Playable; 3 ACR / MAF Soldier Bodies

### COMPLETED

- **Red Gum Station (`L_RedGum_01`)**, the first map built on the Fab Rural Australia pack (ADR-022). It is
  built headless: map copy, 16 deployment starts, 3 objectives (Bore Pump, Homestead, Shearing Shed), the
  director, nav bounds and the SS experience.
  - Fences had split the nav mesh into three islands (diagnosed with a 10 m reachability grid). The fence
    meshes now have no collision.
  - The nav pass now fails unless every route leg connects.
- **Soldier bodies.** `ASSCharacterPartActor` (Team) plus the `ISSLocalityPresentable` interface (Core),
  with the bridge tint subsystem applying viewer locality.
  - The viewer's own team shows the Quantum military character (3 ACR); the other team shows
    conventional Modern Insurgent 7 parts (MAF).
  - Meshes follow the mannequin's pose. All three packs use UE-mannequin bone names, so no retarget was
    needed.
  - The body is hidden from its own first-person view.
  - `B_SS_CharacterParts` replaces Lyra's random Manny/Quinn picker in the Game Feature.
- Fab packs registered (L-0016); ADR-022; Dry River nav rebuilt after the Game Feature re-wire.
- No more windowed runs on unwired maps; the blank Example_01 run was only compiling shaders.

### FILES CHANGED

Created:
- `SSLocalityPresentable.h`, `SSCharacterPartActor.{h,cpp}`;
- `Tools/Unreal/build_redgum_level.py`, `build_redgum_nav.py`, `setup_soldiers.py`;
- `Content/Maps/L_RedGum_01.umap`, `SSExp_ObjectiveAssault/Characters/*`;
- `Docs/evidence/G057_redgum_live.txt`.

Modified:
- `SSViewerTeamTintSubsystem.cpp`, `setup_objective_assault.py`;
- the Game Feature data, `L_DryRiver_01.umap` (script re-save plus nav rebuild);
- DECISION_LOG, LICENCE_REGISTER, ASSET_REGISTER, PROJECT_AUDIT.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Guard | `python Tools/validate_architecture.py` | 0 | PASS | — |
| Build | `Build.bat SouthernSpearEditor ...` | 0 | Succeeded | — |
| Automation | `Automation RunTests SouthernSpear` | 0 | 30 Success, 0 Fail | `Build/tests.log` (not retained) |
| Red Gum build | `build_redgum_level.py`, `build_redgum_nav.py` | 0 | ok=true; all 4 legs connect (deploy A to deploy B) | `Build/redgum_*.json` |
| Live, 8 bots | `L_RedGum_01?NumBots=8?RoundSeconds=90 -game -nullrhi` (killed at 420 s, as intended) | 124 | 3 rounds; captures by both teams; round resets | `G057_redgum_live.txt` |
| Soldier parts, live | same, 60 s rounds | 124 | Tint and locality applied to 9 pawns; no SS errors. 288 Lyra `GCNL_Spawning` "Accessed None" warnings (spawn effect has no Niagara system under null RHI) | — |
| Dry River setup and nav | `setup_objective_assault.py`, `build_dryriver_nav.py` | 0 | ok=true | `Build/*.json` |
| Rendered soldier check | windowed `-SSShotAt=150` | 0 | **NOT RUN**: the window was closed at about 150 s (Windows exit request) before the capture | — |

### ASSETS

L-0016 Fab packs (class A); M-RG-01 and C-SOL-01 in the asset register.

### RISKS

New R-19 (Fab dependency of the map and bodies) and R-20 (soldier look not yet visually checked). R-18
logged in the audit.

### DEFECTS FOUND

1. `duplicate_asset` on a map kept the world referenced, causing a fatal "World Memory Leaks" (found by
   the crash log). Fixed: load the source, then save-as.
2. `save_map` fails when the target exists (found in the step report). Fixed: delete the old copy first.
3. Per-instance fence collision edits do not persist, because the construction script reruns on load
   (found with the island grid). Fixed at the mesh level.

### NEXT ACTION

**Rendered soldier check** on Red Gum (one windowed `-SSShotAt` run, about 3 minutes, shaders are cached
after the first run). Confirm the 3 ACR and MAF looks, hide any insignia patch (R-20), then start the
first-person view model (R-18).

---

## Session 020 — 2026-09-27 — CC BY Terrain Scans Staged for Import Review

### COMPLETED

- Audited `Content/Sourced/` against `Docs/SOURCED_ASSET_REVIEW.md` and the licence register.
- Verified the official Sketchfab model pages: Split Point and Bingie Bingie are licensed CC BY 4.0 and authored by Stefan A Vollgger. Staged each original OBJ/MTL/JPEG set unchanged under `Content/SouthernSpear/Vendor/SAVollgger/`.
- Added ENV-001 and ENV-002 to `ASSET_REGISTER.md`, completed L-0013/L-0014 provenance rows, and put required credits beside the vendor files.
- Left Ross River unstaged. All other sourced files were left untouched and unapproved.

### FILES CHANGED

Created: `Content/SouthernSpear/Vendor/SAVollgger/README.md` and two vendor source folders, each with its unchanged OBJ, MTL and JPEG files.
Modified: `Docs/ASSET_REGISTER.md`, `Docs/LICENCE_REGISTER.md`, `Docs/SOURCED_ASSET_REVIEW.md`, `Docs/CHANGELOG.md`.

### TESTING

| Test | Command | Result |
|---|---|---|
| Sketchfab provenance/licence | Opened official model pages | PASS — correct titles, authors and CC BY licence; register records the 4.0 version |
| Source archives | `unzip -t` on both archives | PASS — no archive errors |
| Source-file identity | SHA-256 of each staged file vs matching archive member | PASS — all six OBJ/MTL/JPEG hashes match exactly |
| MTL image paths | Python check against staged filenames | PASS — each MTL image reference resolves |
| Mesh inspection | Python OBJ scan | PASS — Split Point 174,076 vertices / 346,200 triangles; Bingie Bingie 273,042 vertices / 540,708 triangles; all faces triangular |
| Git LFS attributes | `git check-attr filter diff merge text` | PASS — OBJ and JPEG files resolve to LFS |
| Unreal Editor import | — | **NOT RUN** — no `.uasset` import or editor validation yet |
| Optimization/derivative | — | **NOT DONE** — original scan files retained; not game-ready |
| Game/map use | — | **NOT DONE** — neither scan placed in a level |

### ASSETS

Two class-B third-party source sets staged unchanged: ENV-001 Split Point and ENV-002 Bingie Bingie. Include their registered CC BY 4.0 credits if used in a shipped build. No derived or imported Unreal asset was made.

### RISKS

- The remaining sourced drop still includes explicitly rejected game rips and unresolved/licence-blocked assets; all remain untouched and outside Git.
- Both scans are dense photogrammetry and may need cleanup, reduction, LOD/Nanite review, collision work and performance validation before real-time use.
- Ross River is licence-cleared but not staged; Cape Liptrap remains rejected under CC BY-NC-ND.

### DEFECTS FOUND

- Session 017 shorthand used the wrong L-number range after L-0012 was assigned to declined Electric Dreams. Current references now read L-0012 (declined), L-0013 Split Point, L-0014 Bingie Bingie and L-0015 Ross River.
- The sourced review's previous “nothing imported” phrasing did not distinguish copied vendor source files from actual Unreal `.uasset` imports; it now does.

### NEXT ACTION

Import both OBJ files into a temporary Unreal review folder and inspect scale, texture binding, normals, collision, LOD/Nanite options and editor performance before making any adapted game asset.

---

## Session 021 — 2026-09-27 — Southern Spear UI Pass; Animated Soldiers; First-Person Weapon

### COMPLETED

- **Soldier animation fixed.** Lyra attaches parts through a ChildActorComponent, so the part's direct
  parent was never the animated mesh. `ASSCharacterPartActor` now walks up to the first skinned mesh,
  and all 9 pawns log "leader CharacterMesh0".
- **First-person weapon view model.** `USSFirstPersonSubsystem` puts an owner-only copy of the held
  weapon's mesh on the camera:
  - hip and aimed (ADS) placements;
  - look sway and walk bob;
  - the body copy of the weapon is hidden from the owner.
  - Arms are not done yet (R-18 stays open).
- **Southern Spear UI replaces Lyra's** (ADR-023):
  - `SouthernSpearUI` plugin with a player HUD: health bar, ammunition and weapon name, a crosshair that
    opens with movement and hides when aiming, and a clay flash when hit.
  - Esc match menu: Resume, Leave Match, Quit.
  - Title front end `L_SS_FrontEnd`: key art; Red Gum Station and Dry River with bots; Quit. It is now
    `GameDefaultMap`.
  - Loading screen: the new key art (`Docs/images/loadingscreen.png`), an animated label and tips.
  - Lyra's StandardHUD action set is removed from `B_SS_ObjectiveAssault`; `ProjectName` is now
    Southern Spear.
- **Minimap and full map** (`SouthernSpearObjectivesUI`): a north-up minimap centred on the player, and
  the full map on M. Both use a client-local orthographic scene capture and show objective markers in
  viewer-relative tones, plus a player arrow.
- `USSLocalHudState` (Core) is the plain HUD data. The Lyra bridge (`USSHudStateSubsystem`) fills it
  from Lyra's health component and quick-bar ammunition stats; UI modules only read it.
- **New weapon files reviewed; none imported:**
  - AKM and PKM: producer-supplied .blend files; real designs, needing A-series reshaping.
  - C4A1: the file embeds "Cycles-Ready M4 Carbine … Licensed CC-BY" (author file name kkanamalla),
    so it is third-party and needs its source URL and credit.
  - A88/New: no licence text; the .mtl texture names do not match the supplied PNGs; 72k faces, 4K maps.
    Source URL and terms needed.

### FILES CHANGED

Created:
- `Plugins/SouthernSpearUI/*` (plugin, palette, widget kit, HUD, menu, loading screen, front-end game
  mode, HUD subsystem);
- `SSLocalHudState.h`, `SSHudStateSubsystem.{h,cpp}`, `SSMinimapWidget.{h,cpp}`;
- `Tools/Unreal/setup_ui.py`, `Content/Maps/L_SS_FrontEnd.umap`,
  `Plugins/SouthernSpearUI/Content/Textures/T_SS_KeyArt`, `Docs/images/loadingscreen.png`.

Modified:
- `SSCharacterPartActor.{h,cpp}`, `SSFirstPersonSubsystem.{h,cpp}`, bridge Build.cs;
- `SSObjectiveHudSubsystem.{h,cpp}`, ObjectivesUI Build.cs;
- `SouthernSpear.uproject`, `Config/DefaultGame.ini`, `Config/DefaultEngine.ini`;
- `setup_objective_assault.py`, `B_SS_ObjectiveAssault`, `CLAUDE.md`, `DECISION_LOG.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Guard | `python Tools/validate_architecture.py` | 0 | PASS | — |
| Build | `Build.bat SouthernSpearEditor ...` | 0 | Succeeded (after fixing 2 compile errors) | — |
| Automation | `Automation RunTests SouthernSpear` | 0 | 30 Success, 0 Fail | — |
| UI content | `setup_ui.py` | 0 | ok=true (key art, experience HUD removed, front-end map) | `Build/ui_setup.json` |
| Front end boots | `-game -nullrhi` (no map) | 124 | `LoadMap /Game/Maps/L_SS_FrontEnd`, game class SSFrontEndGameMode, "front end shown" | log |
| Red Gum live | `L_RedGum_01?NumBots=8 -game -nullrhi` | 124 | 9 soldier parts, leader CharacterMesh0; SS player HUD shown; view model shows SM_A88; objective widget shown | log |
| Rendered look (HUD, menu, loading, minimap, soldiers, view model) | — | — | **NOT RUN** (headless only; placements may need tuning) | — |
| Esc / M / menu buttons with real input | — | — | **NOT RUN** | — |

### ASSETS

T_SS_KeyArt (producer key art). New weapon source files are not imported and not registered: they await
source URLs and licences, and A-series reshaping.

### RISKS

R-18 partly mitigated (weapon view model; no arms). R-20 is still open (no rendered check).

### DEFECTS FOUND

1. Soldier bodies were unanimated: leader pose looked only at the direct attach parent (reported by the
   producer; confirmed by the new "leader" log line).
2. Three compile errors: palette alpha overload, and `FSlateChildSize` fill weights (found by the build).

### NEXT ACTION

**Rendered UI check.** One windowed run from the front end into Red Gum, with screenshots of the menu,
loading screen, HUD, minimap and view model; then tune placements.

---

## Session 022 — 2026-09-27 — UI Polish Pass, Settings, Round Banners, Textured A88, Website Rundown

### COMPLETED

- **Movement fix.** The front end left input in UI-only mode across the map load. Starting a map, and the
  HUD appearing, now both restore game input.
- **Front end.** Intro from black, the title tracking in, staggered reveals, and map cards for Red Gum
  Station and Dry River. Also a bot count selector (4/8/12), Settings and Quit, a top status bar and a
  controls strip.
- **Match menu (Esc).** Blurred backdrop, a side panel sliding in, Resume, Settings, Leave Match, Quit, and
  a controls card.
- **Settings screen (new).** Window mode, resolution, graphics quality, VSync and frame limit (applied
  through UGameUserSettings), plus field of view (70–110°; `FSSUserPrefs`, read by the first-person
  camera; aiming narrows it proportionally).
- **In match:**
  - compass strip with objective markers and the active objective's distance;
  - round banners: round start, assault, "Objective X secured" in the capturer's viewer-relative tone,
    and the round result;
  - flashing reload prompt; ammunition turns clay below a quarter of the magazine.
- **A88 now uses the producer-supplied textured model** (`Art/Weapons/A88/New`):
  - `Tools/Blender/a88_sourced.py` assigns slots by object name; the download's .mtl pointed at missing
    files, and its black/white texture is a mask, not colour. Pairings were chosen from rendered
    permutations.
  - It also normalises to +X, metres and the grip origin, and adds the muzzle socket.
  - `setup_weapons.py` gains a textured path (`M_SS_TexturedPBR`, `MI_A88_Tex*`, `T_A88_*`).
  - Result: 78.8 cm, 72k triangles.
- **Website:**
  - full-bleed key-art hero;
  - "What is Southern Spear?" rundown and pillars;
  - a mirrored-factions diagram (each team sees itself as 3 ACR, the other as MAF);
  - "In the build today" with honest status tags;
  - scroll reveal (respects reduced motion) and a blurred sticky nav;
  - Discord link (nav, hero, community).
- HUD subsystems skip worlds without a game viewport (headless test worlds).

### FILES CHANGED

Created:
- `SSSettingsWidget.{h,cpp}`, `SSUserPrefs.h`, `SSCompassWidget.{h,cpp}`, `SSRoundBannerWidget.{h,cpp}`;
- `Tools/Blender/a88_sourced.py`, `Docs/images/keyart.jpg`;
- A88 textured assets, `M_SS_TexturedPBR`.

Modified:
- `SSMenuWidget.{h,cpp}`, `SSPlayerHudWidget.{h,cpp}`, `SSPlayerHudSubsystem.cpp`, `SSWidgetKit.h`;
- `SSObjectiveHudSubsystem.{h,cpp}`, `SSLocalHudState.h`, `SSHudStateSubsystem.cpp`,
  `SSFirstPersonCameraMode.{h,cpp}`;
- `setup_weapons.py`, `publish_site.py`, `Site/*`, `LICENCE_REGISTER.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Guard | `python Tools/validate_architecture.py` | 0 | PASS | — |
| Build | `Build.bat SouthernSpearEditor ...` | 0 | Succeeded (first blocked by the parallel session's test file until it compiled) | — |
| Weapons | `setup_weapons.py` | 0 | ok=true; A88 78.8×13.1×29.8 cm, muzzle socket present | `Build/weapons_setup.json` |
| Automation | `Automation RunTests SouthernSpear` | 255 | 30 Success; 1 Fail: `SouthernSpear.Network.Gameplay.TwoPlayerAuthoritySmoke` (the parallel session's new, uncommitted test). Its ensure `ViewportOverlayWidget.IsValid()` comes from CommonLoadingScreen during the test's map load (stack: test line 87) | `Build/tests.log` |
| Red Gum live | `L_RedGum_01?NumBots=8 -game -nullrhi` | 124 | SS HUD shown; view model SM_A88; captures by both teams | log |
| Website | `publish_site.py --build-only` + browser preview at 1440×900 and 375×812 | 0 | Hero, rundown, mirror, build sections render; hero reveal fixed for background tabs | — |
| Rendered game UI (menu, settings, banners, compass, textured A88) | game launched for the producer | — | **Producer review pending** | — |

### ASSETS

L-0017 A88 sourced model: the producer states it is royalty free; source URL and terms pending. The raw
download is not committed until they are recorded. The key art has a national-flag shoulder patch on the
soldier: producer to confirm it suits the fictional 3 ACR (ADR-016).

### RISKS

R-21 (new): the A88 sourced model's licence evidence is missing (producer statement only); it is a
real-rifle replica, and ADR-021 requires A-series reshaping.

### DEFECTS FOUND

1. No movement after the front end: UI-only input persisted across travel (reported by the producer).
2. Website hero copy invisible: bottom-of-viewport reveal, and rAF paused in background tabs (browser
   preview).
3. The website hero copy overlapped the wordmark in the key art (browser preview).

### NEXT ACTION

**Producer review of the rendered UI**, then the other session fixes its smoke test's loading-screen
ensure so the suite is green.

---

## Session 023 — 2026-09-27 — Weapon Asset Intake and Provenance Review

### COMPLETED

- Reviewed the current untracked weapon-source folders against Session 021/022 notes, source-file paths, the asset register, licence register and the tracked A88 game assets.
- Corrected the A88 record: the producer-supplied textured mesh is already the imported/in-use cosmetic asset, while the original script-built A88 remains separate source work. The A88 source itself is not tracked; the imported Unreal derivative is tracked, so the missing source URL/terms and real-rifle redesign remain release blockers (R-21 / L-0017).
- Recorded the C4A1/M4 file as blocked despite its embedded/reported “Licensed CC-BY” note: no source URL, exact licence version/terms or attribution has been verified; its adjacent texture folder is empty in this checkout. Added R-22 / L-0020.
- Recorded the AKM and PKM `.blend` files as provenance/licence-pending, reference-only, and not approved for import or derivative use. Added R-23 / L-0018–L-0019.
- Added a weapon-source review section and aligned W-001/W-002 and A88 import/source rows in `ASSET_REGISTER.md`. Updated `PROJECT_AUDIT.md` risk rows and the licence register. No art files, `.uasset`s, or scripts were changed; no smoke-test work was performed.

### FILES CHANGED

Modified: `Docs/ASSET_REGISTER.md`, `Docs/LICENCE_REGISTER.md`, `Docs/PROJECT_AUDIT.md`, `Docs/CHANGELOG.md`.

### TESTING

| Check | Command / method | Result |
|---|---|---|
| Intake inventory | Reviewed `Art/Weapons/A88/New`, `AKM`, `C4A1`, `PKM` and their corresponding notes | Completed; no source provenance was added or assumed |
| A88 import state | Read existing `Build/weapons_setup.json`, `Build/sm_a88_sourced_report.json`, `Build/a88_setup.json`; checked tracked asset paths with `git ls-files` | Existing report says setup `ok=true`; mesh 78.8 × 13.1 × 29.8 cm, 72,493 triangles; textured import assets are tracked. This is review of existing evidence, not a rerun. |
| Source-control/LFS rules | `git status --short --untracked-files=all -- <asset paths>`; `git check-attr filter diff merge text -- <sample asset paths>` | Raw A88/AKM/C4A1/PKM files are untracked; sampled OBJ/PNG/Blend sources resolve to LFS. No assets staged or committed. |
| Build, import or runtime validation | — | **NOT RUN** — documentation/provenance review only |
| Headless authority smoke test | — | **NOT RUN** — explicitly shelved at producer direction |

### ASSETS

No asset files created, imported or modified in this session. L-0017 records A88 as Class E until rights evidence is supplied. L-0018–L-0020 record the AKM, PKM and C4A1/M4 sources as blocked; source folders remain local/untracked. No new asset is cleared for use or redistribution.

### RISKS

- **R-21** — A88 rights/source provenance and fictional redesign remain unresolved; importantly, its Unreal derivative is already imported/in use despite the raw source being untracked.
- **R-22** — C4A1/M4 terms and attribution unverified.
- **R-23** — AKM/PKM provenance and rights unverified; real-design files remain reference-only.

### DEFECTS FOUND

- Asset records lagged project state: W-001 still described a placeholder, and the A88 Unreal import was not clearly distinguished from its local untracked source and previous original script-built mesh.
- The C4A1's embedded “Licensed CC-BY” label could be mistaken for verified rights; exact provenance and terms are missing.

### NEXT ACTION

Obtain and verify the source URLs and licence terms for A88/C4A1, and confirm whether AKM/PKM are reference-only; keep all unresolved raw sources out of redistribution and redesign any weapon geometry as original A-series work before release.

---

## Session 024 — 2026-09-27 — ADFRC Extraction Intake Review and Claude Source Guard

### COMPLETED

- Inspected the new `Content/Sourced/ADF_Extracted/` tree and representative EF88/M4A5 paths. Unlike the separately reviewed `Content/Sourced/ADF/` folder (whose zero-model count applied only to that folder), this extraction contains `.p3d` models, Arma configs/material definitions, textures, `.rtm` animations and Workshop package data.
- Checked the public ADF Re-Cut Workshop notice, ADFRC `LICENSE.md`, `ASSETS_LICENSE.md`, `DEV_LICENSE.md`, `MODEL_CREDITS.md`, and Bohemia's APL-SA text. The stated terms do not clear the extracted models or APL-SA material for this Unreal/commercial project; ADFRC further restricts protected-model extraction/reuse. Corrected the earlier ADF addendum so the contributor agreement is not described as an end-user licence or blanket relicensing path.
- Cross-referenced `adfrc_ef88` and `adfrc_m4a5` against Claude's A-series guidance and the independent A88/C4A1 source records. Matching EF88/M4 naming is not provenance or permission, and these files are not the sources recorded at L-0017 or L-0020.
- Added a metadata-only quarantine instruction for Claude, a sourced-asset addendum, an explicit non-game-asset note in `ASSET_REGISTER.md`, licence record L-0021 and open risk R-24. No source files were copied, altered, staged or imported; `ADF_Extracted` remains git-ignored.

### FILES CHANGED

Modified: `CLAUDE.md`, `Docs/SOURCED_ASSET_REVIEW.md`, `Docs/ASSET_REGISTER.md`, `Docs/LICENCE_REGISTER.md`, `Docs/PROJECT_AUDIT.md`, `Docs/CHANGELOG.md`.

### TESTING

| Check | Command / method | Result |
|---|---|---|
| Intake inventory | Listed the `ADF_Extracted` tree and representative directories; read sample EF88/M4A5 config/model metadata | Completed. Representative inventory only; no total file count or size was measured. No model/texture/animation binary was opened or processed. |
| Git ignore | `git check-ignore -v Content/Sourced/ADF_Extracted/Models/ADF_Weapons/adfrc_ef88/ADFRC_EF88.p3d` | Exit 0 — `.gitignore:189:Content/Sourced/` ignores the representative extracted model. |
| Rights/source review | Read public Steam Workshop item 2971219389, ADFRC licence/model-licence/developer-agreement/model-credit pages, and Bohemia APL-SA text | Completed; sources and access date recorded in `SOURCED_ASSET_REVIEW.md`. This is project intake triage, not legal advice or item-level clearance. |
| Git working tree | `git status --short --branch` | `main`; concurrent pre-existing docs, code, and content changes were present and left untouched. |
| Documentation whitespace | `git diff --check -- CLAUDE.md Docs/SOURCED_ASSET_REVIEW.md Docs/ASSET_REGISTER.md Docs/LICENCE_REGISTER.md Docs/PROJECT_AUDIT.md Docs/CHANGELOG.md` | Exit 0 — no whitespace errors. Git emitted only configured CRLF-to-LF notices for existing CRLF documents. |
| Unreal import/build/tests | — | **NOT RUN** — documentation/provenance review only; no Unreal assets were created or changed. |
| Headless authority smoke test | — | **NOT RUN** — remains shelved per producer direction. |

### ASSETS

No game assets created, copied, imported or modified. `Content/Sourced/ADF_Extracted/` remains an ignored quarantine folder, not a licensed vendor source. L-0021 records the collection as blocked (known APL-SA/protected-model incompatibility; individual provenance remains unresolved); no ADFRC content was added to the game asset register as usable art.

### RISKS

- **R-24 (new)** — ADFRC extraction includes Arma assets with non-commercial/Arma-only APL-SA terms and additional restrictions for protected models; exact local file provenance and per-model categories are unknown. Keep metadata-only and quarantined.
- R-17 remains open for the broader mixed sourced drop. R-21 through R-23 remain unchanged.

### DEFECTS FOUND

- No code or content defect was found. The documentation gaps were that Claude's general sourced-content warning did not identify this new ADFRC extraction or its stronger model-specific restrictions; the earlier “0 models” inventory could be overgeneralized beyond the distinct `Content/Sourced/ADF/` folder; and the prior addendum described the developer agreement as an alternative downstream licence. These boundaries and the agreement's actual scope are now explicit.

### NEXT ACTION

Obtain exact source-chain evidence and written, file-specific rights-holder permissions for any ADFRC item proposed for use; until then, keep the extraction quarantined and continue only with independently sourced or original A-series assets.

---

## Session 025 — 2026-09-27 — ADFRC Growth, Player-Model Question, and a Broken FBX Conversion

### COMPLETED

- Re-inspected `Content/Sourced/ADF_Extracted/` after it grew: it now carries a `README.md`, a `_tools/` converter directory and an empty `Models_FBX/`, and measures 7,928 files / ~17 GB (against 7,748 claimed in its README).
- Recorded the extraction's now-documented provenance from its own README: the ADFRC source pack (LFS objects fetched and decoded) **plus the binarised Steam Workshop release** (15 `.pbo` archives unpacked from the local Arma 3 install), which is the only source of its `.p3d` models. That corrects the earlier L-0021 note that the acquisition path was undocumented, and it places the models squarely inside the category ADFRC's `ASSETS_LICENSE.md` and `DEV_LICENSE.md` §2.4 restrict.
- Answered the player-model question with measurements: **there are no player/character body models in the tree** — `Workshop/ADF_Units` holds 0 `.p3d` and 13 `.paa`, only binarised config headers that dress vanilla Arma bodies. What exists is 56 player-worn gear meshes (helmets, facewear, NVGs, field dress, a Crye G3 uniform, plate carriers, backpacks, TBAS role vests).
- Diagnosed the FBX conversion as **failing on every model**: `Models_FBX/` contains no exported geometry, and `_convert_log.txt` shows the identical error each time — `P3D_Error: Invalid MLOD signature: b'ODOL'`, because the Arma 3 Object Builder addon expects the newer `MLOD` signature. No Blender or Unreal process is running.
- Did **not** import, convert or re-export anything. Added the measured inventory, provenance, gear list, conversion failure and a new operational hazard to `Docs/SOURCED_ASSET_REVIEW.md`; corrected L-0021's provenance and added a models row; added **R-25** for ~17 GB of loose assets sitting inside the Unreal content root.

### FILES CHANGED

Modified: `Docs/SOURCED_ASSET_REVIEW.md`, `Docs/LICENCE_REGISTER.md`, `Docs/PROJECT_AUDIT.md`, `Docs/CHANGELOG.md`.

### TESTING

| Check | Command / method | Result |
|---|---|---|
| Tree growth | `find`/`ls` over `ADF_Extracted` (top level, extension histogram, file count, `du -sh`) | Top level now `Animations Models Models_FBX README.md Source Textures Workshop _tools`; 7,928 files / 17 GB. Histogram: 2,500 `.paa`, 2,489 `.png`, 854 `.rvmat`, 536 `.p3d`, 330 `.rtm`, 257 `.wss`, 257 `.wav`, 165 `.json`, 37 `.uasset`. |
| Provenance | Read `Content/Sourced/ADF_Extracted/README.md` | Two sources documented (source pack + binarised Workshop PBOs); models come only from the PBOs; README carries its own licence warning and asks that the model clause be verified before import. |
| Player-model existence | `find Workshop/ADF_Units -iname '*.p3d' -o -iname '*.paa'`; `grep` of `ADF_Units/Modern/CDO/Infantry.hpp` | **0 `.p3d`**, 13 `.paa`. Unit definitions are binarised config headers only; no ADFRC soldier body exists. |
| Gear inventory | `find Models/ADF_Gear Models/ADF_Gear_2 -iname '*.p3d'` | 56 player-worn gear meshes listed (helmets, facewear, NVGs, `crye_g3.p3d`, `adfrc_field_dress.p3d`, `JPC_Base`, `Peacekeeper_*`, backpacks, `tbas_T2_*`/`TBAS_T5_*`). |
| Conversion state | `cat Models_FBX/_convert_log.txt`; `find Models_FBX -type f \| wc -l` | Log shows 3 attempts, all `FAIL` with `Invalid MLOD signature: b'ODOL'` via `bpy.ops.a3ob.import_p3d`. Only 1 file in the tree (the log) — **no FBX exported**. |
| Conversion processes | `tasklist \| grep -iE 'blender\|unreal'` | `none` — no conversion or editor process is running. |
| Git working tree | `git status --short --branch` | `main`; the pre-existing and Session 024 documentation changes remain uncommitted and were left in place. |
| Unreal import / build / tests | — | **NOT RUN** — nothing was imported or converted; documentation and measurement only. |
| Moving the tree out of `Content/` (R-25) | — | **NOT RUN** — deferred to producer direction this session. |

### ASSETS

No assets created, imported, converted or modified. `Models_FBX/` remains empty. The 56 gear meshes stay quarantined under L-0021 / R-24 and are **not** cleared for import: the models came from the binarised Workshop release that ADFRC's terms protect, and they additionally carry real manufacturer and service identities (Crye Precision, Ops-Core, PASGT, "Team Wendy") that ADR-016 and L-0007 bar regardless of licence. The project's actual player bodies remain the Fab packs under L-0016 wired through `B_SS_Soldier`.

### RISKS

- **R-25 (new)** — ~17 GB of loose source assets, including ~10 GB of PNG and 37 `.uasset` files, sit inside the Unreal content root; the tree's README warns of an auto-import of ~2,484 PNGs on next editor open. Move the tree outside `Content/` before opening the editor.
- **R-24** unchanged and now better evidenced: provenance is documented, and it documents extraction from the binarised release.
- R-17, R-21 to R-23 unchanged.

### DEFECTS FOUND

1. **The FBX conversion pipeline is broken, not merely incomplete.** `Models_FBX/` was created and three models were attempted, but every one failed with `Invalid MLOD signature: b'ODOL'` and no geometry was produced. Anyone waiting on FBX output from that addon for this content will wait forever; the ODOL models need a different path. Found by reading the conversion log rather than by looking for FBX files.
2. **The request's premise does not hold: there are no player models here.** The ADFRC units pack dresses vanilla Arma bodies and ships no body meshes, so the tree offers gear, not characters. Found by counting `.p3d` under `Workshop/ADF_Units`.
3. **A new operational hazard was introduced by the extraction growing in place** (R-25): 17 GB of source now lives under the Unreal content root, with the tree's own README warning of an auto-import of thousands of textures. Found by measuring the tree against `.gitignore` and the content root.
4. **The extraction's README asserts the assets were provided for this game.** That is recorded as a producer-side claim, not a rights-holder grant; it does not displace APL-SA or the protected-model terms.

### NEXT ACTION

Decide the direction for player models: source properly licensed character and gear packs and wire them in, build original CMECU/MAF gear in Blender per ADR-020, or seek a written commercial licence from the ADFRC rights holders — and separately, move `Content/Sourced/ADF_Extracted/` out of `Content/` to close R-25 before the editor is next opened.

---

## Session 026 — 2026-09-27 — Original Australian Uniforms on the Player Models

### COMPLETED

- **The ADFRC request was declined, and the alternative was built instead.** The producer asked to use textures and patterns — and helmet models — from `Content/Sourced/ADF_Extracted/`. Those cannot be used: the models were extracted from the binarised Workshop release that ADFRC's `ASSETS_LICENSE.md` and `DEV_LICENSE.md` §2.4 protect (no extraction, no derivatives, no other media), the textures are APL-SA which is **non-commercial and Arma-only**, and the gear additionally carries real manufacturer and service identities (Crye Precision, Ops-Core, PASGT, "Team Wendy") barred by ADR-016 and L-0007. Not even as a tracing reference: ADR-016 requires CMECU to be an original pattern. So the goal was met with original work instead.
- **Inventoried what is actually wired in.** 3 ACR is the single Fab mesh `SKM_QuantumCharacter` (14 material slots, including a blue rolled-up shirt and blue jeans); MAF is seven single-slot parts (head, hands, sweater, military pants, shoes, small armour, beret). Both packs ship `.uasset` only.
- **Established that material-instance overrides are impossible on the 3 ACR body.** Its materials sample textures directly with no `TextureSampleParameter2D`, so there is no parameter to override. The MAF materials do expose parameters, but a uniform approach was chosen instead.
- **Authored original texture sets by script** (`Tools/Textures/make_character_textures.py`): CMECU dry-country camo, MAF red-earth camo, and tan/dark gear fabric, each with base colour, a twill micro-normal and an ORM map — 12 PNGs, 2048² for camo and 1024² for gear.
- **Authored four original fabric materials** and applied them as per-slot cosmetic overrides, so the licensed vendor meshes are neither duplicated nor edited. Added `FSSPartMaterialOverride` and the two override arrays to `ASSCharacterPartActor` (SouthernSpearTeam, the cosmetic module — presentation only, ADR-004).
- **Fixed a committed build break** that was blocking every editor build: `SSCompassWidget.cpp` and `SSMinimapWidget.cpp` each declare `constexpr int32 MaxMarkers` in an anonymous namespace, which collide when UBA merges them into one unity TU. Renamed to `CompassMaxMarkers` / `MinimapMaxMarkers`.

### FILES CHANGED

Created: `Tools/Textures/make_character_textures.py`, `Tools/Common/uv_material_params.py`, `Tools/Unreal/probe_character_materials.py`, `Tools/Unreal/setup_character_textures.py`, `Tools/Unreal/verify_character_materials.py`, `Art/Characters/Textures/*.png` (12), and the imported material/texture assets under `/SSExp_ObjectiveAssault/Characters/`.
Modified: `Plugins/SouthernSpearTeam/Source/SouthernSpearTeam/Public/SSCharacterPartActor.h`, `.../Private/SSCharacterPartActor.cpp`, `Plugins/GameFeatures/SSExp_ObjectiveAssault/Content/Characters/B_SS_Soldier.uasset`, `Docs/ASSET_REGISTER.md`, `Docs/LICENCE_REGISTER.md`, `Docs/PROJECT_AUDIT.md`, `Docs/CHANGELOG.md`.

**Files I do not own, changed to unblock the build:** `Plugins/SouthernSpearObjectives/Source/SouthernSpearObjectivesUI/Private/SSCompassWidget.cpp` and `SSMinimapWidget.cpp` (local constant rename only). Left uncommitted for the owning session to adopt or revert.

### TESTING

| Check | Command / method | Result |
|---|---|---|
| Texture generation | `python Tools/Textures/make_character_textures.py` | 12 PNGs written to `Art/Characters/Textures/`, report `Build/character_textures.json` count 12. |
| Texture appearance | Contact sheet rendered and **visually inspected** in the browser | CMECU reads as dry-country camo with three populated luma bands; MAF reads as red-earth; gear is clean flat nylon. Two defects were found this way and fixed (see below). |
| Material wiring probe | `probe_character_materials.py` (read-only) | 14 friendly slots and 7 MAF parts enumerated with their vendor masters; `Build/character_materials.json`. |
| Material parameter names | `Tools/Common/uv_material_params.py` on the vendor `.uasset` binaries | 3 ACR materials confirmed to have **no** texture parameters; MAF confirmed to have `TextureSampleParameter2D`. Justifies authoring our own masters. |
| Editor build | `Build.bat SouthernSpearEditor Win64 Development` | **Result: Succeeded**, 9.52 s, after the unity-collision fix. |
| Architecture guard | `python Tools/validate_architecture.py` | **PASS**, exit 0, no violations. |
| Material + override setup | `setup_character_textures.py` | `ok=true`: 4 materials authored, 12 textures imported, `B_SS_Soldier` saved. `Build/character_materials_setup.json`. |
| Override read-back | `verify_character_materials.py` | Friendly: 7 of 14 slots overridden (cap, holster, carrier, patches, boonie → GearTan; shirt, jeans → CMECU). Opposing: 5 of 7 parts (sweater, pants → MAF; shoes, armour, beret → GearDark). |
| Material contents | `uv_material_params.py` on the saved `M_SS_*.uasset` | Each carries all three texture references, `MaterialExpressionTextureSampleParameter2D` and `SAMPLERTYPE_Normal`. |
| Automation | `Automation RunTests SouthernSpear` | **30 Success, 1 Fail.** The failure is `SouthernSpear.Network.Gameplay.TwoPlayerAuthoritySmoke` — the parallel session's uncommitted test, failing on the same `ViewportOverlayWidget.IsValid()` ensure at `SSGameplayAuthoritySmokeTest.cpp:93` already recorded in Session 022. **Not caused by this session.** Log `Build/tests_character_materials.log`. |
| **Rendered in-game view** | windowed `-game -SSShotAt=30` on `L_DryRiver_01` | **NOT ACHIEVED** — exit 124. The run stalls during module load, before the map; no screenshot written. Headless `-nullrhi` runs are unaffected (45 s). Environment limitation, not a code fault. **The uniforms have therefore not been seen on the meshes in game.** |
| ADFRC content | — | **NOT IMPORTED** — nothing from `ADF_Extracted` was read into the engine, as decided above. |

### ASSETS

Original, class F, script-built: CH-TEX-001/002/003 (12 PNGs) and CH-MAT-001 (4 materials). CH-SOL-001 is the existing soldier bodies carrying those materials as overrides — the underlying Fab geometry is unmodified and remains L-0016 class A. No ADFRC asset was imported. `LICENCE_REGISTER.md` L-0016 now records the modification; `ASSET_REGISTER.md` §4.9f tracks every derivative.

### RISKS

- **R-20 (mitigated)** — the `M_Patches` slot is overridden with plain fabric, so vendor insignia is no longer displayed, but no rendered view exists yet to confirm the rest of the body.
- **R-25** unchanged: the 17 GB ADFRC tree still sits inside `Content/`. Measured this session that it does **not** slow headless editor runs (45 s project open), so the risk is now understood as interactive-editor friction rather than a blocker.
- R-24, R-17, R-21 to R-23 unchanged.

### DEFECTS FOUND

1. **`HEAD` did not compile.** `SSCompassWidget.cpp` and `SSMinimapWidget.cpp` both declare `constexpr int32 MaxMarkers` in an anonymous namespace; under a unity build UBA merges them and the definitions collide. It surfaced only once my change invalidated the makefile and forced a different unity grouping — a latent break sitting in commit `75444a03`. Found by building rather than assuming the tree was green.
2. **The camo banding was mathematically wrong.** The first implementation's soft-threshold logic made the first tone dominate, so the pale dust band never appeared: the CMECU luma histogram occupied only two bins and the gear looked stained rather than dyed. Caught by checking the luma histogram before looking at the image, then confirmed and fixed visually.
3. **`M_Patches` may have carried insignia** (R-20). Now overridden with plain fabric.
4. **UE 5.8 exposes no material-introspection API** usable from Python for this (`expression_collection`, `get_material_property_input_expression` and `get_material_expression` are all absent), so `verify_character_materials.py` could not enumerate expressions. Verification fell back to reading the saved packages' name tables — a real check of what was written, but not a graph traversal.

### NEXT ACTION

**Get a rendered view of both sides in game to confirm the new uniforms and close R-20.** The windowed `-game` run currently stalls before the map load; diagnose that first (it blocks every rendered check in the project, not just this one).

---

## Session 023 — 2026-09-27 — Soldier Animation Layers and Reload Fixed; A88 Provenance

### COMPLETED

- **Running animation and A88 reload fixed** (reported by the producer). Lyra picks the body mesh and the
  weapon animation layers (locomotion and the reload montage) from cosmetic tags on character parts.
  Lyra's own Manny part carries `Cosmetic.AnimationStyle.Masculine` and `Cosmetic.BodyStyle.Medium`
  (found by probing `B_Manny`); `ASSCharacterPartActor` carried none, so no rifle animation set linked.
  It now implements `IGameplayTagAssetInterface` with the same default tags, re-checked at BeginPlay in
  case the tag config loads after the class default object.
- **A88 provenance recorded (L-0017).** The producer's source page is the RigModels aggregator listing
  "EF88 Rifle 3D Model": licence shown as "Royalty Free", author credited as Upsurge Studios
  (upsurgestudios.com). It is a replica of a real service rifle with named real-brand attachments; the
  original author's terms are not shown.
- The Fab animation pack the producer mentioned is **not in the project yet**: the Fab vault cache holds
  only the packs already imported.

### FILES CHANGED

Modified: `SSCharacterPartActor.{h,cpp}`, `SouthernSpearTeam.Build.cs` (GameplayTags), `LICENCE_REGISTER.md`.

### TESTING

| Test | Command | Exit | Result | Evidence |
|---|---|---|---|---|
| Guard | `python Tools/validate_architecture.py` | 0 | PASS | — |
| Build | `Build.bat SouthernSpearEditor ...` | 0 | Succeeded | — |
| Tags live | `L_RedGum_01?NumBots=4 -game -nullrhi` | 124 | "SSCharacterPart tags: Cosmetic.AnimationStyle.Masculine, Cosmetic.BodyStyle.Medium" | log |
| Running animation and reload in play | game launched for the producer | — | **Producer check pending** | — |

### ASSETS

L-0017 updated with the source URL and author credit; still provisional (R-21).

### RISKS

R-21 unchanged: aggregator "Royalty Free" label only; the original author's licence is unconfirmed; it
is a real-rifle replica that needs A-series reshaping.

### DEFECTS FOUND

1. Soldier parts had no cosmetic tags, so no weapon animation layers linked (no running animation, no
   reload). Found by the producer's play report plus a probe of Lyra's `B_Manny`.

### NEXT ACTION

**Producer confirms running and reloading in play**, then imports the Fab animation pack with "Add to
Project".

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
