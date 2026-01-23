

const pad = (num: number): string => `0${num}`.slice(-2)

export type StartEvent = 'start' | 'resume'
export type StopEvent = 'reset' | 'finish' | 'pause'
export type TimerListener = (elapsed: number) => void

export interface Timer extends TimerState {
  events: Map<TimerEvent, Set<TimerListener>>
  off: (event: TimerEvent, handler?: TimerListener) => void
  on: (event: TimerEvent, handler: TimerListener) => void
  pause: () => void
  reset: () => void
  resume: () => void
  start: () => void
  stop: (event?: StopEvent) => void
  toggle: () => void
  update: () => void
}
export type TimerEvent = StopEvent | 'update' | StartEvent

export interface TimerState {
  elapsed: number
  running: boolean
}

/**
 *  Formats a total time in milliseconds into a human-readable string.
 *  The format is `HH:MM:SS` if hours are present, otherwise `MM:SS`.
 *
 *  @param totalTime - The total time in milliseconds to format.
 *  @returns A formatted time string (e.g., "01:23:45" or "23:45").
 */
export function formatTime(totalTime: number): string {
  const hours = (totalTime / 36e5) | 0
  totalTime %= 36e5
  return `${hours > 0 ? `${pad(hours)}:` : ''}${pad((totalTime / 6e4) | 0)}:${pad(((totalTime % 6e4) / 1e3) | 0)}`
}

/**
 * Creates and returns a new event-driven timer instance.
 *
 *  @param from - The initial `elapsed` time in milliseconds.
 *  @param inc - The increment/decrement value in milliseconds.
 *               A positive value makes the timer count up, a negative value makes it count down.
 *  @param to - (Optional) The target `elapsed` time in milliseconds.
 *              When `elapsed` reaches this value (considering the `inc` direction), the timer will automatically stop and emit a `finish` event.
 *  @returns A `Timer` instance.
 */
export default function timer(from: number, inc: number, to?: number): Timer {
  const state: TimerState = { elapsed: from, running: false }
  const emitter = new Map<TimerEvent, Set<TimerListener>>()
  //@ts-expect-error
  const sign = (inc > 0) - (inc < 0)
  let id: number | undefined

  const emit = (type: TimerEvent, elapsed: number): void => {
    for (const fn of emitter.get(type) ?? []) fn(elapsed)
  }

  /**
   *  Manually triggers a single update cycle. This advances `elapsed` by `inc`
   *  and emits an 'update' event if the timer is running.
   *  Primarily for internal use, but exposed for advanced scenarios or testing.
   */
  const update = (): void => {
    if (state.running) {
      let elapsed = state.elapsed + inc
      if (elapsed < 0) elapsed = 0
      if (to !== undefined && elapsed * sign >= to * sign) {
        state.elapsed = to
        stop()
      } else emit('update', (state.elapsed = elapsed))
    }
  }

  /**
   *  Starts the timer if it's not already running.
   *  Emits a 'start' event.
   *  Throws an error if the `from` and `to` values create an invalid range for the given `inc`.
   */
  const start = (event: StartEvent = 'start'): void => {
    if (to && from * sign > to * sign) throw new Error(`Invalid timer range [${from}, ${to}] on inc ${inc}.`)
    if (!state.running) {
      state.running = true
      emit(event, state.elapsed)
      id = setInterval(update, inc < 0 ? -inc : inc)
    }
  }

  /**
   *  Resumes a paused timer. This starts the timer and emits a 'resume' event.
   */
  const resume = (): void => {
    start('resume')
  }

  /**
   *  Stops the timer.
   *
   *  @param event - (Optional) The specific stop event to emit. Defaults to 'finish'.
   */
  const stop = (event: StopEvent = 'finish'): void => {
    if (state.running || event === 'reset') {
      state.running = false
      emit(event, state.elapsed)
      if (id) {
        clearInterval(id)
        id = undefined
      }
    }
  }

  /**
   *  Pauses the timer. This stops the timer and emits a 'pause' event.
   */
  const pause = (): void => {
    stop('pause')
  }

  /**
   *  Resets the timer's elapsed time to `0` and stops it.
   *  Emits a 'reset' event.
   */
  const reset = (): void => {
    state.elapsed = 0
    stop('reset')
  }

  /**
   *  Toggles the timer's running state. If running, it calls `stop()` (emitting 'finish' by default);
   *  otherwise, it calls `start()` (emitting 'start' by default).
   */
  const toggle = (): void => {
    state.running ? stop() : start()
  }

  /**
   * Registers an event handler for a specific timer event.
   *
   *  @param event - The timer event to listen for.
   *  @param handler - The handler function to call when the event occurs.
   */
  const on = (event: TimerEvent, handler: TimerListener): void => {
    if (!emitter.has(event)) emitter.set(event, new Set())
    emitter.get(event)!.add(handler)
  }

  /**
   *  Removes an event handler for a specific timer event.
   *  Removes all event handlers if no handler is specified.
   *
   *  @param event - The timer event to stop listening for.
   *  @param handler - (optional) The handler function to remove.
   */
  const off = (event: TimerEvent, handler?: TimerListener): void => {
    emitter.get(event)?.[handler ? 'delete' : 'clear']?.(handler as any)
  }

  return Object.assign(state, { events: emitter, off, on, pause, reset, resume, start, stop, toggle, update })
}
