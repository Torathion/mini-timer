import { describe, it, expect, vi, beforeEach } from 'vitest'
import time, { formatTime } from '../src/index'

describe('timer', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  it('counts down', () => {
    const from = 500
    const timer = time(from, -100, 0)
    let lastElapsed = from

    timer.on('update', elapsed => {
      expect(elapsed).toBeLessThanOrEqual(lastElapsed)
      lastElapsed = elapsed
    })

    return new Promise<void>(resolve => {
      timer.on('finish', elapsed => {
        expect(elapsed).toBe(0)
        expect(timer.running).toBe(false)
        resolve()
      })
      timer.start()
      vi.advanceTimersByTime(500) // Advance time to allow the timer to finish
    })
  })

  it('counts up', () => {
    const from = 0
    const timer = time(from, 100, 500)
    let lastElapsed = from

    timer.on('update', elapsed => {
      expect(elapsed).toBeGreaterThanOrEqual(lastElapsed)
      lastElapsed = elapsed
    })

    return new Promise<void>(resolve => {
      timer.on('finish', elapsed => {
        expect(elapsed).toBe(500)
        expect(timer.running).toBe(false)
        resolve()
      })
      timer.start()
      vi.advanceTimersByTime(500) // Advance time to allow the timer to finish
    })
  })

  it('stops', () => {
    const timer = time(1000, -100, 0)

    timer.start()
    expect(timer.running).toBe(true)
    timer.stop()
    expect(timer.running).toBe(false)

    vi.advanceTimersByTime(200)
    expect(timer.running).toBe(false)
  })

  it('handles invalid ranges', () => {
    expect(() => time(1000, 100, -100).start()).toThrow('Invalid timer range [1000, -100] on inc 100.')
    expect(() => time(100, -100, 1000).start()).toThrow('Invalid timer range [100, 1000] on inc -100.')
  })

  it('pauses and resumes', async () => {
    const timer = time(500, -100, 0)
    const startTime = Date.now()

    let finished = false
    let finalElapsed = -1
    let finalEndTime = -1

    const finishPromise = new Promise<void>(resolve => {
      timer.on('finish', elapsed => {
        finished = true
        finalElapsed = elapsed
        finalEndTime = Date.now()
        resolve()
      })
    })

    timer.start()
    expect(timer.running).toBe(true)

    vi.advanceTimersByTime(200) // Fake time is now 200
    expect(timer.elapsed).toBe(300)

    timer.pause()
    expect(timer.running).toBe(false)
    const pausedElapsed = timer.elapsed

    vi.advanceTimersByTime(100) // Does nothing
    expect(timer.elapsed).toBe(pausedElapsed)

    timer.resume()
    expect(timer.running).toBe(true)

    vi.advanceTimersByTime(300) // Fake time is now 500

    await finishPromise

    expect(finished).toBe(true)
    expect(finalElapsed).toBe(0)
    expect(finalEndTime - startTime).toBe(500)
    expect(timer.running).toBe(false)
  })

  it('state transitions', () => {
    const timer = time(100, -10)
    expect(timer.running).toBe(false)

    timer.stop() // stopping an already stopped timer
    expect(timer.running).toBe(false)

    timer.toggle() // should start
    expect(timer.running).toBe(true)

    timer.toggle() // should pause
    expect(timer.running).toBe(false)

    timer.start() // should resume
    expect(timer.running).toBe(true)

    timer.stop()
    expect(timer.running).toBe(false)

    timer.resume()
    expect(timer.running).toBe(true)
    timer.pause() // pause
    expect(timer.running).toBe(false)
    timer.stop() // stop from paused state
    expect(timer.running).toBe(false)

    timer.reset()
    expect(timer.elapsed).toBe(0)
    expect(timer.running).toBe(false)
  })

  it('elapsed property', async () => {
    const timer = time(500, -100, 0)
    expect(timer.elapsed).toBe(500)

    timer.start()
    vi.advanceTimersByTime(200)
    expect(timer.elapsed).toBe(300)

    timer.pause()

    vi.advanceTimersByTime(1000) // Does nothing
    expect(timer.elapsed).toBe(300)

    const promise = new Promise<void>(resolve => {
      timer.on('finish', () => {
        expect(timer.elapsed).toBe(0)
        resolve()
      })
    })

    timer.resume()
    vi.advanceTimersByTime(300)

    return await promise
  })

  it('formatTime function', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(5000)).toBe('00:05')
    expect(formatTime(60000)).toBe('01:00')
    expect(formatTime(3600000)).toBe('01:00:00')
    expect(formatTime(3665000)).toBe('01:01:05')
    expect(formatTime(72000)).toBe('01:12')
    expect(formatTime(420000)).toBe('07:00')
    expect(formatTime(86400000)).toBe('24:00:00') // 24 hours
  })

  it('throws error for invalid timer range', () => {
    const timer = time(10, 10, 5)
    expect(() => timer.start()).toThrowError('Invalid timer range [10, 5]')
  })

  it('handles negative increment that makes elapsed go below zero', async () => {
    const timer = time(50, -100, 0) // Starts at 50, decrements by 100, ends at 0

    return new Promise<void>(resolve => {
      timer.on('finish', elapsed => {
        expect(elapsed).toBe(0)
        resolve()
      })
      timer.start()
      vi.advanceTimersByTime(100) // Allow it to tick once
    })
  })

  it('allows listening to specific events', async () => {
    const timer = time(300, -100, 0)
    const updateSpy = vi.fn()
    const startSpy = vi.fn()
    const finishSpy = vi.fn()
    const resetSpy = vi.fn()
    const pauseSpy = vi.fn()

    timer.on('update', updateSpy)
    timer.on('start', startSpy)
    timer.on('finish', finishSpy)
    timer.on('reset', resetSpy)
    timer.on('pause', pauseSpy)

    timer.start()
    expect(startSpy).toHaveBeenCalledWith(300)

    vi.advanceTimersByTime(100)
    expect(updateSpy).toHaveBeenCalledWith(200)

    timer.pause()
    expect(pauseSpy).toHaveBeenCalledWith(200)

    const promise = new Promise<void>(resolve => {
      timer.on('finish', () => {
        expect(finishSpy).toHaveBeenCalledWith(0)
        timer.reset()
        expect(resetSpy).toHaveBeenCalledWith(0)
        resolve()
      })
    })

    timer.start() // Resume
    vi.advanceTimersByTime(200) // Finish it

    await promise
  })

  it('allows removing event listeners', async () => {
    const timer = time(100, -10, 0)
    const updateSpy = vi.fn()

    timer.on('update', updateSpy)
    timer.start()
    vi.advanceTimersByTime(10)
    expect(updateSpy).toHaveBeenCalledTimes(1)

    timer.off('update', updateSpy)
    vi.advanceTimersByTime(10)
    expect(updateSpy).toHaveBeenCalledTimes(1) // Should not have been called again

    timer.stop()
  })
})
