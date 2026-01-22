# CHANGELOG

## [2.0.0] 01-22-2026

### :boom: Breaking

- Removed [`mitt`](https://www.npmjs.com/package/mitt) as dependency to implement a far simpler event emitter.
  - To remove all event emitters from an event type call `timer.off(<event>)`
