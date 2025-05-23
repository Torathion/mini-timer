import { type Handler } from 'mitt'

declare module 'mini-timer' {
  /**
   * Union type for events that signal the timer has stopped.
   * - 'reset': The timer was stopped and reset to 0.
   * - 'finish': The timer reached its 'to' limit or was manually stopped.
   * - 'pause': The timer was paused.
   */
  export type StopEvent = 'reset' | 'finish' | 'pause'

  /**
   * Union type for events that signal the timer has started or resumed.
   * - 'start': The timer began counting from its initial state.
   * - 'resume': The timer continued counting after a pause.
   */
  export type StartEvent = 'start' | 'resume'

  /**
   * Union type of all possible events the timer can emit.
   * Includes events for stopping, updating, starting, and resuming.
   */
  export type TimerEvent = StopEvent | 'update' | StartEvent

  /**
   * Defines the core state properties of a timer.
   */
  export interface TimerState {
    /**
     * The current elapsed time in milliseconds.
     */
    elapsed: number
    /**
     * Indicates whether the timer is currently running.
     */
    running: boolean
  }

  /**
   * Represents a timer instance, extending `TimerState` with control methods and event handling.
   */
  export interface Timer extends TimerState {
    /**
     *  Removes an event handler for a specific timer event.
     *
     *  @param event - The timer event to stop listening for.
     *  @param handler - The handler function to remove.
     */
    off: (event: TimerEvent, handler: Handler<number>) => void
    /**
     * Registers an event handler for a specific timer event.
     *
     *  @param event - The timer event to listen for.
     *  @param handler - The handler function to call when the event occurs.
     */
    on: (event: TimerEvent, handler: Handler<number>) => void
    /**
     *  Pauses the timer. This stops the timer and emits a 'pause' event.
     */
    pause: () => void
    /**
     *  Resets the timer's elapsed time to `0` and stops it.
     *  Emits a 'reset' event.
     */
    reset: () => void
    /**
     *  Resumes a paused timer. This starts the timer and emits a 'resume' event.
     */
    resume: () => void
    /**
     *  Starts the timer if it's not already running.
     *  Emits a 'start' event.
     *  Throws an error if the `from` and `to` values create an invalid range for the given `inc`.
     */
    start: () => void
    /**
     *  Stops the timer.
     *
     *  @param event - (Optional) The specific stop event to emit. Defaults to 'finish'.
     */
    stop: (event?: StopEvent) => void
    /**
     *  Toggles the timer's running state. If running, it calls `stop()` (emitting 'finish' by default);
     *  otherwise, it calls `start()` (emitting 'start' by default).
     */
    toggle: () => void
    /**
     *  Manually triggers a single update cycle. This advances `elapsed` by `inc`
     *  and emits an 'update' event if the timer is running.
     *  Primarily for internal use, but exposed for advanced scenarios or testing.
     */
    update: () => void
  }

  /**
   *  Formats a total time in milliseconds into a human-readable string.
   *  The format is `HH:MM:SS` if hours are present, otherwise `MM:SS`.
   *
   *  @param totalTime - The total time in milliseconds to format.
   *  @returns A formatted time string (e.g., "01:23:45" or "23:45").
   */
  export function formatTime(totalTime: number): string

  /**
   * Creates and returns a new event-driven timer instance.
   *
   *  @param from - The initial `elapsed` time in milliseconds.
   *  @param inc - The increment/decrement value in milliseconds. A positive value makes the timer count up, a negative value makes it count down.
   *  @param to - (Optional) The target `elapsed` time in milliseconds. When `elapsed` reaches this value (considering the `inc` direction), the timer will automatically stop and emit a `finish` event.
   *  @returns A `Timer` instance.
   */
  export default function timer(from: number, inc: number, to?: number): Timer
}
