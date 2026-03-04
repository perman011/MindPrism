# ADR-V4-001: Canonical Media Path Contract
Status: Proposed
Decision: Canonical persisted media path is `/objects/uploads/...`.
Why: Removes ambiguity and prevents rendering drift across clients.
Consequence: Normalize legacy `/uploads/...` on write and resolve on read.
