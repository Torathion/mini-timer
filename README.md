# micro-timer

<p align="center">
<h1 align="center">The tiniest timer to tick!</h1>
<p align="center">
  <a href="https://www.npmjs.com/package/micro-timer"><img src="https://img.shields.io/npm/v/micro-timer?style=for-the-badge&logo=npm"/></a>
  <a href="https://npmtrends.com/micro-timer"><img src="https://img.shields.io/npm/dm/micro-timer?style=for-the-badge"/></a>
  <a href="https://bundlephobia.com/package/micro-timer"><img src="https://img.shields.io/bundlephobia/minzip/micro-timer?style=for-the-badge"/></a>
  <a href="https://github.com/Torathion/micro-timer/blob/main/LICENSE"><img src="https://img.shields.io/github/license/Torathion/micro-timer?style=for-the-badge"/></a>
  <a href="https://codecov.io/gh/torathion/micro-timer"><img src="https://codecov.io/gh/torathion/micro-timer/branch/main/graph/badge.svg?style=for-the-badge" /></a>
  <a href="https://github.com/torathion/micro-timer/actions"><img src="https://img.shields.io/github/actions/workflow/status/torathion/micro-timer/build.yml?style=for-the-badge&logo=esbuild"/></a>
<a href="https://github.com/prettier/prettier#readme"><img alt="code style" src="https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&logo=prettier"></a>
</p>
</p>

`micro-timer` is the smallest, minimal-dependency event driven timer that quickly and comfortably counts time for you.

```powershell
    pnpm i micro-timer
```

## Usage

The timer requires 2 (optional 3) arguments that define the start and end point with the increment between steps.
The increment define also how long each time iteration is to count. The sign of the increment defines if the timer
counter up (+) or down (-).

```typescript
import timer, { type Timer } from 'micro-timer'

// From 0, count every 100ms until 10,000ms
const t = timer(0, 100, 10000)
```

### Events

The timer has multiple lifecycle events that can be listened on:

```typescript
import timer, { type Timer, formatTime } from 'micro-timer'

const t = timer(10_000, -150, 0)

t.on('update', (elapsed) => formatTime(time)) // formats the time on each tick to a format of xx:xx or xx:xx:xx
t.on('start', () => console.log("Hello"))
t.on('pause', () => console.log("Pause"))
t.on('finish', (elapsed) => console.log("Preemptively finished at", elapsed))

t.start()
// Do stuff for a long time
t.pause()
// Again...
t.resume()

// The timer will stop when it reaches 0, but we can stop it preemptively
t.stop() // The default event of stop is "finish".

// Now, clean everything up with "off"

t.off('update', ...)
---

© Torathion 2025
