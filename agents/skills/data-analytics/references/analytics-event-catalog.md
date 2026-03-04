# Analytics Event Catalog

## Event Schema Standards

All events must include a base payload:

| Field | Type | Required | Description |
|---|---|---|---|
| event_type | string | yes | Snake_case event name |
| user_id | integer | yes | Authenticated user ID |
| timestamp | ISO 8601 | yes | Server-side UTC timestamp |
| session_id | string | yes | Client session identifier |
| event_data | JSONB | no | Event-specific properties |

## Event Catalog

| Event Name | Trigger | Required Properties | Optional Properties | Journey Stage |
|---|---|---|---|---|
| page_view | User navigates to any route | path, referrer | utm_source, utm_medium | Acquisition |
| book_open | User opens a book detail page | book_id, book_title | source (search, browse, recommendation) | Activation |
| book_complete | User finishes all chapters in a book | book_id, duration_total_seconds | rating | Retention |
| chapter_start | User begins a chapter | book_id, chapter_id, chapter_index | resume (boolean) | Activation |
| chapter_complete | User finishes a chapter | book_id, chapter_id, chapter_index, duration_seconds | cards_viewed, cards_total | Activation |
| card_view | User views a card within a chapter | book_id, chapter_id, card_index | card_type | Engagement |
| card_swipe | User swipes to next/previous card | book_id, chapter_id, card_index, direction | swipe_velocity | Engagement |
| audio_play | User starts audio playback | book_id, chapter_id, position_seconds | playback_speed | Engagement |
| audio_pause | User pauses audio playback | book_id, chapter_id, position_seconds | duration_listened | Engagement |
| audio_complete | Audio playback finishes | book_id, chapter_id, total_duration_seconds | completed_naturally (boolean) | Engagement |
| quiz_start | User begins a quiz | book_id, quiz_id, question_count | retry_attempt | Engagement |
| quiz_complete | User finishes a quiz | book_id, quiz_id, score, total_questions | time_spent_seconds | Engagement |
| bookmark_toggle | User adds or removes a bookmark | book_id, chapter_id, action (add/remove) | card_index | Engagement |
| highlight_save | User saves a highlight | book_id, chapter_id, text_length | color | Engagement |
| journal_create | User creates a journal entry | book_id, entry_length_chars | has_prompt (boolean) | Retention |
| onboarding_start | User begins onboarding flow | step_index | referral_source | Acquisition |
| onboarding_complete | User finishes onboarding | steps_completed, interests_selected | time_spent_seconds | Acquisition |
| signup | User creates an account | auth_method | referral_code | Acquisition |
| login | User signs in | auth_method | days_since_last_login | Retention |
| subscription_start | User subscribes to a plan | plan_id, plan_name, price | trial (boolean), coupon_code | Revenue |
| subscription_cancel | User cancels subscription | plan_id, reason | feedback_text, days_subscribed | Revenue |
| share_create | User shares content | content_type, content_id, share_method | recipient_count | Referral |
| search_query | User performs a search | query_text, results_count | filters_applied | Engagement |
| streak_update | User streak increments or resets | streak_length, action (increment/reset) | longest_streak | Retention |
| install_prompt_shown | PWA install prompt displayed | prompt_trigger | days_since_first_visit | Acquisition |
| install_prompt_accepted | User accepts PWA install | prompt_trigger | time_to_accept_seconds | Acquisition |

## Validation Rules

1. All event names use snake_case.
2. book_id must reference a valid books.id when present.
3. chapter_id must reference a valid chapter_summaries.id when present.
4. user_id must reference a valid users.id (enforced by authentication middleware).
5. event_data JSONB must conform to the schema for that event type.
6. Timestamp must be server-generated, not client-supplied.
