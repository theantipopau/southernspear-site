# DEVELOPMENT ROADMAP — Southern Spear

**Document ID:** `Docs/DEVELOPMENT_ROADMAP.md`
**Status:** Phase 1 active
**Last updated:** 2026-10-05

> **Fictional entertainment project.** Not endorsed, developed or approved by the Australian Defence Force, the Department of Defence or the Australian Army.

---

## 1. Philosophy

**Prove the hard parts first, with placeholders.**

Networking, team presentation, authority and persistence are expensive to get wrong and cheap to get right early. Maps, weapon models and animations are expensive in artist time and cheap in risk. So the project spends Phase 1 and 2 on greyboxes proving the systems, and defers all art to Phase 6.

**No map before the vertical slice works. No weapon model before the netcode does.**

---

## 2. Phase Summary

| Phase | Goal | Exit criterion |
|---|---|---|
| **0. Audit & Architecture** | Foundation decided, docs written, repo established | Gate G0.8 passes — Lyra compiles on 5.8.3 |
| **1. Greybox Vertical Slice** | Multiplayer, teams, presentation, one objective, one map, all placeholders | **All 14 acceptance criteria met** |
| **2. Infantry Combat** | Full weapon set, grenades, suppression, medical, movement | Combat systems pass automated + manual tests |
| **3. Training & Progression** | Full training menu, qualifications, ranks, service record, barracks | Qualification → role unlock works end-to-end |
| **4. Maps & Layers** | Five maps, multiple layers, streaming, AI navigation | Every map meets performance budget |
| **5. Online Hardening** | Deployment, EOS, reconnection, admin, anti-cheat, load test, security review | Security review closed |
| **6. Content & Polish** | Final art, audio, accessibility, performance, packaging | Release gate passed |

---

## 3. Phase 0 — Audit & Architecture

**Status: IN PROGRESS.**

### Completed
- Workspace, engine, toolchain, hardware and disk audited with reproducible commands → `PROJECT_AUDIT.md`
- Git repository initialised on `main`; Unreal `.gitignore`, `.gitattributes`, Git LFS configured and **verified** via `git check-attr`
- Design, technical, asset, licence, roadmap and test documents authored
- Lyra 5.8 obtained; `EngineAssociation: "5.8"` confirmed against installed UE 5.8.3

### Remaining — gate G0.8
1. Complete the Lyra download (in progress at time of writing)
2. Copy Lyra into the repo; rename `.uproject` to `SouthernSpear.uproject`
3. Build `SouthernSpearEditor Win64 Development` — **record the output verbatim**
4. Log every divergence in `LYRA_ADOPTION.md`
5. Create the `SouthernSpear*` plugin skeleton

**Exit:** a successful editor compile is recorded. If Lyra does not compile, switch to the fallback in TDD §1.1 and log it as a decision.

---

## 4. Phase 1 — Greybox Vertical Slice

**One playable map. Two teams. One rifle per team. One objective mode. Everything else is a placeholder.**

### 4.1 Scope

| Area | Delivered |
|---|---|
| Map | **Dry River**, greybox, one layout |
| Teams | Two replicated teams, assignment, respawn |
| Presentation | Friendly Australian force vs Murasian Armed Forces, from both perspectives |
| Weapons | One rifle, one weapon per team, placeholder mesh |
| Mode | **Objective Assault**, one objective sequence |
| Server | Packaged **dedicated server** build |
| Session | Create, discover, join, passworded |
| UI | Basic settings menu that persists |
| Training | Basic firing range, one qualification that saves |
| Lifecycle | Warm-up → round → end → restart |
| Scoreboard | Replicated, valid |
| Progression | Basic save/load |

### 4.2 Vertical Slice Backlog — in priority order

Each item is independently testable and produces a working increment.

| # | ID | Task | Depends on | Done when |
|---|---|---|---|---|
| 1 | VS-01 | Vendor Lyra, rename project, compile editor | — | `Build.bat SouthernSpearEditor` exits 0 |
| 2 | VS-02 | Stand up `SouthernSpearCore` (tags, log categories, module rules) | VS-01 | Compiles; depends on nothing of ours |
| 3 | VS-03 | `FSSServiceRecord` + `ISSPersistenceProvider` + local dev provider + schema v1 | VS-02 | Unit test: save → reload → identical |
| 4 | VS-04 | Settings save/load via `GameSettings` | VS-03 | Settings survive client restart |
| 5 | VS-05 | `ESS_TeamId` + `ULyraTeamSubsystem` adaptation + replicated team assignment | VS-02 | Unit test: assignment is balanced and deterministic |
| 6 | VS-06 | **`UFSSFactionPresentationSet`** + `UFSSFactionPresentationResolver` | VS-05 | Unit test: both perspectives resolve to opposite sides |
| 7 | VS-07 | Presentation↔gameplay decoupling guard (CI grep) | VS-06 | CI fails on a deliberate violation |
| 8 | VS-08 | Symmetry test — identical gameplay data across factions | VS-06 | Test asserts byte-identical tuning |
| 9 | VS-09 | `UFSSWeaponDefinition` + placeholder rifle + GAS fire/reload | VS-05 | Unit test: capacity, fire modes, reload timings |
| 10 | VS-10 | Server-authoritative hit validation | VS-09 | Security test: forged client damage is rejected |
| 11 | VS-11 | Dry River greybox map | VS-05 | Playable, two deployment zones, cover |
| 12 | VS-12 | Objective actor + capture logic + replication | VS-11 | Network test: objective state replicates and is stable |
| 13 | VS-13 | Objective Assault game mode (round lifecycle) | VS-12 | Round completes, fails and restarts |
| 14 | VS-14 | `SouthernSpearServer.Target.cs` + server target builds | VS-01 | Server binary produced |
| 15 | VS-15 | Packaged client connects to packaged dedicated server | VS-14 | Two clients join the same match |
| 16 | VS-16 | Scoreboard (replicated) | VS-15 | Test: values match server state |
| 17 | VS-17 | Training range + one qualification that saves | VS-03 | Qualification persists across restart |
| 18 | VS-18 | Net emulation: latency, jitter, packet loss | VS-15 | Degradation is acceptable at 150 ms + 5% loss |
| 19 | VS-19 | Spectator + kill feed information-leak tests | VS-15 | No leak detected |
| 20 | VS-20 | Licence audit: every asset traced | all | Zero unregistered assets |

**Critical path: VS-01 → VS-05 → VS-06 → VS-15.** Everything else can run in parallel branches.

### 4.3 Phase 1 exit — the 14 acceptance criteria

The milestone is complete only when **all** of these are demonstrated with a recorded result:

| # | Criterion | Evidence required |
|---|---|---|
| 1 | Packaged client connects to a packaged dedicated server | Command transcript + screenshot |
| 2 | Two or more clients join the same match | Video/log from both perspectives |
| 3 | Players assigned to opposing replicated teams | Server log |
| 4 | Each player sees their side as the friendly Australian force | **Both** clients, recorded |
| 5 | Each player sees the opposing side as the hostile faction | **Both** clients, recorded |
| 6 | Damage processed by the server | Test asserting the server issued it |
| 7 | One objective mode completed, failed and restarted | Three recorded runs |
| 8 | Round ends correctly | Log |
| 9 | Scoreboard shows valid replicated data | Test |
| 10 | Training qualification completed and saved | Save file + reload |
| 11 | Settings persist after client restart | Before/after transcript |
| 12 | Project compiles with no unexplained errors | Clean build log |
| 13 | Multiplayer tested with simulated latency and packet loss | Net emulation results |
| 14 | No unlicensed asset used | Licence audit |

> **A listen server is not accepted as evidence for criterion 1.** The dedicated server must be packaged and separate.

---

## 5. Phase 2 — Infantry Combat

| ID | Task | Done when |
|---|---|---|
| IC-01 | A88 Standard Service Rifle (placeholder mesh, real data) | Data-driven, fires, reloads, replicates |
| IC-02 | AK-pattern counterpart | Identical gameplay data, different presentation |
| IC-03 | F89-style support weapon + bipod | Bipod deploy/stow affects stability |
| IC-04 | Opposing support weapon | As above, mirrored |
| IC-05 | Service pistol / sidearm | Both sides |
| IC-06 | Grenades (smoke, fragmentation) | Thrown, bounce, explode server-side |
| IC-07 | Suppression system | Measurable; affects stability and vision |
| IC-08 | Damage model: location sensitivity | Zone falloff implemented and tuned |
| IC-09 | Incapacitation, bleeding, stabilisation | Downed → stabilised → back in the round |
| IC-10 | Field dressing (limited, slow) | Self-treatment worse than medic |
| IC-11 | No in-round health regeneration | **Automated test asserts absence** |
| IC-12 | Movement: crouch, sprint, lean, vault, prone (if quality allows) | Validated, no arcade movement |
| IC-13 | Movement → stability/noise coupling | Sprinting measurably worse |
| IC-14 | Role limits enforced server-side | Cannot exceed team/squad caps |
| IC-15 | Friendly-fire policy + escalation | Log → warning → escalation |
| IC-16 | Voice integration assessment | Documented decision on voice stack |
| IC-17 | Weapon obstruction near walls | Muzzle pushes in |
| IC-18 | Reload interruption | Cancelling a reload is correct and replicated |

---

## 6. Phase 3 — Training & Progression

| ID | Task | Done when |
|---|---|---|
| TP-01 | Training menu shell (CommonUI) | Controller-navigable |
| TP-02 | Module 1 — Induction | Awards basic access |
| TP-03 | Module 2 — Weapons Qualification | Scored; best result stored |
| TP-04 | Module 3 — Support Weapons Qualification | Scored; unlocks gunner |
| TP-05 | Module 4 — Field Skills | Unlocks medic |
| TP-06 | Module 5 — Leadership Qualification | Gated behind prerequisites |
| TP-07 | Qualification → role unlock chain | **Automated test**: each unlock opens exactly its roles |
| TP-08 | Rank progression from data table | Thresholds applied; **no C++ numbers** |
| TP-09 | Commendations | Awarded, displayed, persisted |
| TP-10 | Service record screen | Complete, persistent |
| TP-11 | Barracks (customisation, loadout, badges) | Functional with placeholders |
| TP-12 | XP award rules with per-match caps | **Test asserts no uncapped event** |
| TP-13 | Offline training support | Completed training survives server downtime |
| TP-14 | Schema migration chain | Old record loads into new schema |

---

## 7. Phase 4 — Maps & Layers

| ID | Task |
|---|---|
| MP-01 | Layer system fully data-driven (mode, TOD, weather, objectives, roles, vehicles, respawn, tickets, AI) |
| MP-02 | **Selat Canal** — objective placement. All three objectives are 42–75% walk&#8209;imbalanced, on the only Special Forces map. Highest priority: the geometry is the best in the project, the objectives are the worst |
| MP-03 | **Dry River** — cover in the open ground, and spawn exposure. 35 of 64 start pairs can see each other; an eighth of the ground has no cover within 30 m |
| MP-04 | **Red Gum Station** — take it out of rotation or dress it. 17% nav coverage and no soft cover on a kilometre map, and it is currently in a match |
| MP-05 | **Objective walk parity** on Saltbush and Dry River — 35%, 22% and 58% on objectives worth points mid&#8209;round |
| MP-06 | **Saltbush** — cover mix. 289 hard to 29 soft; every rock is a hard corner, so there is nothing to swing one wide on |
| MP-07 | **Ravenshoe Crossing** — bake navigation. Built and dressed (467 actors, 32/32 structural checks) but not yet AI&#8209;playable; then run it through the same playability audit |
| MP-08 | **Bluestone** — first playtest, design document, and the same audit |
| MP-09 | Low-light layers for all maps |
| MP-10 | Map streaming / World Partition tuning |
| MP-11 | AI navigation volume + cover generation |
| MP-12 | Map performance passes against budget |

`Docs/MAPS_PLAYABILITY_AUDIT.md` measures four maps against the rules written for Dry River
(`Tools/Unreal/audit_map_playability.py`, read-only). Dry River 3 pass / 6 fail, Red Gum
3 / 6 / 1 n&#8209;a, Selat Canal 5 / 5, Saltbush 7 / 3. The rows above are that document's own priority
order. It also found that `layout_spawns.py` measured exposure against a single enemy point rather
than all 64 pairs, so every earlier exposure figure was optimistic.

Each map: Objective Assault + Secure and Hold + Day + Low-light. **No map reproduces a real base, installation or operationally useful site.**

---

## 8. Phase 5 — Online Hardening

| ID | Task |
|---|---|
| OH-01 | Dedicated-server deployment documentation + automation |
| OH-02 | EOS integration behind `ISSOnlineSession` |
| OH-03 | Reconnection handling |
| OH-04 | Administration commands (kick, temp ban, perm ban) |
| OH-05 | Append-only admin audit log |
| OH-06 | Player reporting pipeline |
| OH-07 | Anti-cheat integration assessment + pluggable hook |
| OH-08 | Load testing at target player counts |
| OH-09 | Security review: authority, validation, rate limiting, sanitisation |
| OH-10 | Friendly-fire consequence tuning from real telemetry |

---

## 9. Phase 6 — Content & Polish

| ID | Task |
|---|---|
| CP-01 | Final character assets (male/female bodies, modular kit) |
| CP-02 | Final weapon models (all 15) |
| CP-03 | Final animations (all 13 sets, incl. LODs) |
| CP-04 | Audio pass (13 categories) |
| CP-05 | VFX pass |
| CP-06 | UI polish (all 12 screens) |
| CP-07 | Original multicam-style material set |
| CP-08 | Accessibility pass — every GDD §9 feature verified |
| CP-09 | Performance pass against every budget in TDD §9 |
| CP-10 | **Zero placeholders remaining** — enforced as a packaging gate |
| CP-11 | Packaging and release preparation |
| CP-12 | Legal/insignia clearance (LICENCE_REGISTER L-0003, L-0004) |

---

## 10. Definition of Done (every task)

A task is done only when **all** of these hold:

1. Compiles with no unexplained errors.
2. Relevant automated tests written and passing.
3. Launched and manually exercised where applicable.
4. Multiplayer tested **from both team perspectives** if it involves team presentation.
5. Results recorded in the session report — **no invented results**.
6. Documentation updated.
7. Committed with a clear message.
8. Licence impact, if any, recorded in `LICENCE_REGISTER.md`.
9. Asset status updated in `ASSET_REGISTER.md`.
10. Any departure from Lyra recorded in `LYRA_ADOPTION.md`.

---

## 11. Working Method (per cycle)

1. State the specific objective.
2. Identify files and assets to be modified.
3. Create or update a small implementation plan.
4. Make the smallest coherent change.
5. Compile.
6. Run relevant automated tests.
7. Launch the project where possible.
8. Test multiplayer from both team perspectives.
9. Record results.
10. Update documentation.
11. Commit the working change with a clear commit message.

### Never

- Rewrite working systems without evidence.
- Delete functional content merely to simplify implementation.
- Introduce paid dependencies without approval.
- Use unlicensed content.
- Invent test results.
- Mark placeholder work as final.
- Build all planned maps before the vertical slice works.
- Rely on a listen server as proof that dedicated-server networking works.
- Implement progression exclusively on the client.
- Copy *America's Army 2* assets, maps, UI, names or source code.

---

## 12. Session Report Template

Every work session ends with:

```
COMPLETED
- Exact changes made

FILES CHANGED
- Files created, modified or removed

TESTING
- Commands or editor tests performed
- Results
- Failures or limitations

ASSETS
- Assets created
- Assets imported
- Licence entries added
- Remaining placeholders

RISKS
- Technical debt
- Network risks
- Performance concerns
- Licensing concerns

NEXT ACTION
- The single highest-priority next development task
```

---

## 13. Current Status

| Phase | State |
|---|---|
| Phase 0 | **Complete** — G0.8 passed; G0.9 blocked by engine distribution (R-09); G0.10 passed |
| Phase 1 | **Active** — G1.1, G1.2, G2.0, G2.1 passed; SouthernSpearCore, SouthernSpearTeam and SouthernSpearObjectives built and tested; VS-12/VS-13 Objective Assault running on Dry River (`CHANGELOG.md` Session 008). Session 048: Section Assault (ADR-031) and VS-03 service record + ranks (ADR-032, `SouthernSpearProgression`) **written, not yet compiled** |
| Phase 1 at 2026-10-05 (Session 098) | Slice playable on **Dry River, Red Gum and Wandarra** (Wandarra rebuilt Australian, watchtowers on three maps); Quantum soldiers for both factions, class gear, flag patches, camera recoil from per-weapon rows, HUD (health, ammo, compass, minimap, objectives, rank markers), SVD/PKM for MAF. **Open before the slice can close:** attended R-82 nav bake (Wandarra, Ravenshoe), Red Gum nav coverage, watchtower access (R-100), weapon zero and recoil from real data, VFX (flash, tracer, impacts), character visual acceptance. New unintegrated packs: mocap and weapon animations, damage indicators, open-world foliage (`ASSET_REGISTER` 4.9r) |
| Phases 2–6 | Not started |

**Next action:** see the single NEXT ACTION in the latest `CHANGELOG.md` session.
