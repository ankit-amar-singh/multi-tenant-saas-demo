# ADR 003: CASL-based Role Access Control (RBAC)

## Context & Problem Statement
Administrative endpoints like inviting team members, modifying subscription tiers, or reading audit logs require strict role gating.

## Decision Outcome
Adopted explicit RBAC role assertions (`OWNER`, `ADMIN`, `MEMBER`). Higher-privilege actions (like upgrading subscription plan or renaming workspace) are restricted exclusively to `OWNER`, while member invitations require at least `ADMIN`.
