# ItemCollection Specification

## Overview

The current database allows that an item should belong only to a single collection. Update it so an item can be a part of multiple collections at once.

## Requirements

### Migration

Create a migration that contains the details below, so it can be easily replicated across multiple environments, if needed.

### Seed file

Update the `prisma/seed.ts` file to handle the details below.

### ItemCollection

Create a table that matches the items to the collections. It is an N:N relationship.

- **itemId:** Item id
- **collectionId:** Collection id

### Collections & Items

Maintain the collections and items that are already in the database.
