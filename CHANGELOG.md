# CHANGELOG

## [2.0.1] 01-23-2026

**This patch is a cleanup patch as the project is considered "done"**

### :rocket: Performance

- Shortened logic
- Reduced number of function calls

### :bug: Fixed

- missing optional argument in `off` type declaration.

### :shit: Removed

- Unnecessary CI and dev dependencies to make the download size of `package.json` smaller.

## [2.0.0] 01-22-2026

### :boom: Breaking

- Removed [`mitt`](https://www.npmjs.com/package/mitt) as dependency to implement a far simpler event emitter.
  - To remove all event emitters from an event type call `timer.off(<event>)`
