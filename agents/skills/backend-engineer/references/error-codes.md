# Error Code Catalog

Error codes are namespaced by domain. Each entry includes the HTTP status, a user-facing message, and debug context.

## AUTH_*

| Code | HTTP | Message | Debug Info |
|------|------|---------|------------|
| AUTH_UNAUTHORIZED | 401 | You must be signed in to access this resource. | Missing or expired session cookie. |
| AUTH_FORBIDDEN | 403 | You do not have permission to perform this action. | Required role vs actual role. |
| AUTH_SESSION_EXPIRED | 401 | Your session has expired. Please sign in again. | Session ID and expiry timestamp. |
| AUTH_INVALID_TOKEN | 401 | The provided authentication token is invalid. | Token prefix for debugging (never full token). |

## STRIPE_*

| Code | HTTP | Message | Debug Info |
|------|------|---------|------------|
| STRIPE_NOT_CONFIGURED | 500 | Payment processing is not available at this time. | Missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET. |
| STRIPE_WEBHOOK_FAILED | 400 | Unable to process payment event. | Stripe event ID and verification error. |
| STRIPE_PRICE_MISSING | 500 | The requested pricing plan could not be found. | Expected price ID vs configured IDs. |
| STRIPE_SUBSCRIPTION_EXPIRED | 403 | Your subscription has expired. Please renew to continue. | Subscription ID and expiry date. |

## BOOK_*

| Code | HTTP | Message | Debug Info |
|------|------|---------|------------|
| BOOK_NOT_FOUND | 404 | The requested book does not exist. | Requested book ID. |
| BOOK_INVALID_STATUS | 422 | The book cannot be moved to the requested status. | Current status and attempted transition. |
| BOOK_PUBLISH_VALIDATION_FAILED | 422 | The book does not meet publishing requirements. | List of missing fields or failed checks. |

## UPLOAD_*

| Code | HTTP | Message | Debug Info |
|------|------|---------|------------|
| UPLOAD_FILE_TOO_LARGE | 400 | The uploaded file exceeds the maximum allowed size. | File size vs max size in bytes. |
| UPLOAD_INVALID_TYPE | 400 | The uploaded file type is not supported. | Provided MIME type vs allowed types. |
| UPLOAD_STORAGE_ERROR | 500 | Unable to store the uploaded file. Please try again. | Storage backend error message. |

## VALIDATION_*

| Code | HTTP | Message | Debug Info |
|------|------|---------|------------|
| VALIDATION_INVALID_INPUT | 422 | The provided input is invalid. | Zod error output with field paths. |
| VALIDATION_MISSING_FIELD | 422 | A required field is missing. | Field name and expected type. |
| VALIDATION_SCHEMA_MISMATCH | 422 | The request body does not match the expected format. | Schema name and diff summary. |
