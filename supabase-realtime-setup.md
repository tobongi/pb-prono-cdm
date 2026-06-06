# Supabase Realtime Setup

Run this in the Supabase SQL editor to enable real-time broadcasting for the predictions table:

```sql
alter publication supabase_realtime add table predictions;
```

This is required for the leaderboard live updates (Task 17) to work.
