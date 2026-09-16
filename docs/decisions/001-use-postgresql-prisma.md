# ADR 001: Use PostgreSQL & Prisma ORM

## Context & Problem Statement
A multi-tenant SaaS application requires structured relational integrity, foreign key cascading for workspace member cleanups, and fast indexed lookups for audit logs and tenant data isolation.

## Decision Drivers
- Need for strict foreign key constraints between `Workspace`, `User`, and `WorkspaceMember`.
- Type-safe database queries across TypeScript monorepo packages.
- Easy migration tooling and zero-downtime schema evolution.

## Considered Options
1. MongoDB (Document Database)
2. PostgreSQL with Prisma ORM
3. MySQL with TypeORM

## Decision Outcome
Chosen **PostgreSQL with Prisma ORM**. PostgreSQL provides enterprise reliability, index performance, and strict relational constraints. Prisma generates fully typed TypeScript clients matching our `@repo/types` definitions.
