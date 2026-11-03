# System analysis (C5; also startup stage 6, light)

System analysis answers "what the system does, with which data and interfaces, to which quality". Process work is in `processes.md`.

## Lite subset (startup stage 6)

For an MVP without a formal client: functional and non-functional requirements with numbers (10-20 lines, each tied to a problem), a conceptual data model on one page, at most five ADRs, data classification. Skip notations, formal sign-off and the full ТЗ; promote to the full set when the work moves to corporate mode.

## 1. Requirements: three levels and traceability

| Code | Level | Example |
|---|---|---|
| B | business | "Increase the number of inbound requests through the site" |
| F (ФТ) | functional | "The system must ..." with actor, action, result |
| T (НФТ) | technical / non-functional | a number and a condition of measurement |

Each requirement: **ID · wording · basis (problem from discovery, SWOT, JTBD, constraint) · priority · acceptance criterion**. Without a basis - delete or find the basis. A problem without a requirement and an effect is a hole. Sample: `../examples/requirements-traceability-sample.md`; register template: `../assets/templates/requirements-register.md`.

Priority: high - the core process does not work without it; medium - important, delivered in phases; low - desirable. Groups of functional requirements (example from a scheduling system): generation, substitutions, journal, analytics, notifications.

## 2. Non-functional requirements - numbers only

| Category | Example (replace) |
|---|---|
| Performance | report generated within 30 s for 40 classes and 80 teachers; response within 2 s at normal load |
| Availability | at least 99% in working hours (07:00-22:00 local) |
| Security | roles and rights, HTTPS, password hashing (bcrypt/argon2), personal data protection |
| Scalability | several organisations in one installation |
| Compatibility | browsers, mobile from 360 px; API for integrations |
| Regulatory | separate group: law, sanitary norms, personal data |

Personal data law: check the current rules of the client's country on the date (for Uzbekistan see `fundraising-pack/references/uzbekistan.md`).

Also: constraints (financial, time, staff) as a list; roles and rights as a table "role -> sees and does".

## 3. Motivation chain (ArchiMate)

driver -> stakeholder -> constraint -> goal -> requirement -> KPI (baseline -> target). Measurable outcomes, for example test coverage >= 70%, defects -50%, deployment automation 90%.

## 4. Data model: three levels

| Level | What | When |
|---|---|---|
| Conceptual | entities and relationships, no attributes; one page | stage 6, to discuss with the client |
| Logical | attributes, keys, cardinalities, optionality; DBMS-independent | before development, for MVP entities |
| Physical | types, indexes, partitions | in migrations |

Classify data early (personal, sensitive): it is a design constraint. Patterns: `organization_id` on every entity for multi-tenancy; validity period `valid_from / valid_to` instead of deleting; 3NF with denormalised views for reports only; M:N through a link table; indexes on foreign keys; supertype and subtypes (ticket -> economy/business/first).

## 5. Architecture

- Layers: client -> API gateway (JWT, rate limiting) -> business services -> data stores; async events through a queue.
- Technology stack as a table: layer | technology | reason.
- Single points of failure (SPOF): list and the TO-BE without them (cluster, redundancy, real-time sync).
- Security risk method: **asset -> threat -> vulnerability -> control**.
- Multi-system landscape -> ArchiMate; two views usually suffice (layered, application cooperation).
- Reference build pipeline (to-be): merge request -> code review + quality gate -> CI in a container -> unit tests as a merge gate -> artifact registry -> staging (orchestration, infrastructure as code) -> observability.

## 6. Choice of solution (build / buy / SaaS / do nothing)

1. 3-4 alternatives; **always include "change nothing" or "keep it manual"**. Compare TCO over 3-5 years.
2. Qualitative comparison per criterion (full / partial / none + comment).
3. Weighted scoring: criteria from requirements in three groups (functional, operational, technological); weights inside a group sum to 1; scale 1-3 (weak / partial / full); **one line of reason per score**; do not copy weights from an example; check stability: does the winner stay when weights move by 0.1?
4. Winner plus the condition that makes the choice wrong (review trigger). Optionally add TCO over 3-5 years.


## 7. ADR (architecture decision record) (template: `../assets/templates/adr.md`)

Title · status (proposed / accepted / superseded) · context · decision · alternatives · consequences · review trigger. 3-5 for an MVP: storage, authentication, deployment, integration, key library.

## 8. ТЗ - technical specification (template: `../assets/templates/tz-skeleton.md`)

When the client or the contract requires it. 13 sections and what goes in each:

| # | Section (Russian) | Content |
|---|---|---|
| 1 | General information (Общие сведения) | parties, project name, term, funding, glossary |
| 2 | Basis (Основание) | contract, order or decision; regulations |
| 3 | Goals and purpose (Цели и назначение) | business goals with measurable indicators; users; scope |
| 4 | Requirements (Требования) | B/F/T and regulatory; roles; priorities; acceptance criteria |
| 5 | Interface and UX | screens, flows, roles, accessibility, devices, languages |
| 6 | Integrations | systems, protocols, direction, frequency, errors |
| 7 | Data and migration | model reference, sources, migration plan, quality rules, retention |
| 8 | Security | roles, authentication, encryption, audit, backup, data classification |
| 9 | Environments | dev / test / stage / prod, hosting, monitoring |
| 10 | Acceptance (Приёмка) | criteria, test types, procedure, who signs |
| 11 | Work plan | stages, deliverables, dates, responsibilities |
| 12 | Constraints and assumptions | budget, time, technical, legal, client dependencies |
| 13 | Change procedure | request, impact assessment, decision authority, versions |

Good ТЗ: every requirement is verifiable (number or criterion); solutions are not hidden inside requirements; versioned; test documentation attached (`delivery.md`).
