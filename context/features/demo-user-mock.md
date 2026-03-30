# Demo user mock

## Overview

Replace the mocked email from the `src/lib/db/items.ts` and `src/lib/db/collections.ts` with an userId parameter so really fetch the resources from the logged user.

## Requirements

- Remove all occurrences of `DEMO_USER_EMAIL`
- Refactor all usage of `DEMO_USER_EMAIL` to a userId parameter
