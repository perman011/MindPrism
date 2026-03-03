# ADR-V3-003: Range-Enabled Media Delivery
Status: Proposed
Decision: Support HTTP byte ranges for `/objects/*` streaming.
Reason: Browser audio/video players rely on range requests for seek/play reliability.
Consequences: Slightly more route logic, significantly better media playback behavior.
