# ADR 002: JWT Authentication & Tenant Isolation Middleware

## Context & Problem Statement
Users can belong to multiple workspaces with different roles (e.g. `OWNER` in Workspace A, `MEMBER` in Workspace B). The API must securely authenticate requests and enforce isolation so a user cannot access data in a workspace where they lack membership.

## Decision Outcome
Implemented JWT authentication paired with NestJS workspace middleware. Every incoming request resolves the target workspace slug, verifies active `WorkspaceMember` record, and attaches the active role to the request context.
