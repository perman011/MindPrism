# MindPrism API Standards

## Response Shape

All API responses must use a consistent envelope:

```json
{
  "data": {},
  "error": null,
  "meta": {}
}
```

- `data` — payload on success, `null` on error.
- `error` — `null` on success, error object on failure (see error-codes.md).
- `meta` — optional metadata (pagination, timing, request ID).

## HTTP Status Codes

- 200 — Success (GET, PUT, PATCH, DELETE).
- 201 — Created (POST that creates a resource).
- 400 — Bad request (malformed syntax, missing required fields).
- 401 — Unauthorized (no valid session or token).
- 403 — Forbidden (authenticated but insufficient role).
- 404 — Not found.
- 422 — Validation error (well-formed request but fails Zod schema).
- 500 — Internal server error.

## Pagination Contract

Paginated endpoints return metadata in `meta`:

```json
{
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

- Default `limit` is 20, max 100.
- Page numbering is 1-based.

## Auth Requirements by Route Prefix

- `/api/admin/*` — requires `writer` role or above.
- `/api/stripe/*` — requires authenticated session (any role).
- `/api/books/*` (write operations) — requires `writer` role.
- `/api/books/*` (read operations) — public or authenticated depending on book status.
- `/api/journal/*` — requires authenticated session (owner only).
- `/api/analytics/*` — requires `writer` role or above.

## Validation Rules

- All POST, PUT, and PATCH request bodies must be validated with Zod schemas.
- Zod schemas live alongside route handlers or in a shared `shared/schema.ts`.
- Validation errors return 422 with field-level error details in the error object.
- Query parameters for GET requests should be validated with Zod where applicable.

## Error Serialization

```json
{
  "error": {
    "code": "BOOK_NOT_FOUND",
    "message": "The requested book does not exist.",
    "details": {}
  }
}
```

- `code` — machine-readable, namespaced (see error-codes.md).
- `message` — user-facing, safe to display.
- `details` — optional debug info (field errors, constraints, IDs). Omitted in production for 500s.
