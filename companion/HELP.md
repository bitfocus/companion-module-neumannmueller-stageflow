# Stageflow

This module controls the Stageflow timing app by Neumann&Müller GmbH & Co. KG.

## Configuration

Enter the Stageflow host (e.g. `stageflow.local`) and port (e.g. `2703`), or pick a
discovered instance from the Bonjour list. The Stageflow app must be running with a
valid licence - the network port only opens after the licence has been confirmed in
the app.

## Actions

**Timer control**

- Start, Pause, Start/Pause, Reset/Restart, Reset & Pause, Clear
- Set direction: count down / count up (only while the timer is stopped)
- Add or reduce time (seconds or minutes)
- Set / clear warn time
- Define Preset (input time, warn time, direction, optional direct start)
- Choose Preset - recalls a preset defined in the Stageflow remote.
  **Note:** Preset IDs start at 0 (the first preset in the list is ID 0).

**Display control** (each with a Mode option, see below)

- Show/hide timer, current time, date, time bar, minus sign
- Show timer in seconds, leading zeros (minutes/hours)
- Blink screen / background when time is up
- Stop at 0 (no overtime count), sync seconds, NTP sync
- Blackout, Flash

**Messages**

- Define message / fullscreen message (supports variables)
- Show/hide message / fullscreen message on stage

### The Mode option (Toggle / On / Off)

Display-control actions have a Mode option:

- **Toggle** flips the current state - works with every Stageflow version.
- **On** / **Off** set the state explicitly. For `Blackout`, `Flash`,
  `Show message` and `Show fullscreen message` this works with every Stageflow
  version. For the remaining display toggles it requires a Stageflow app version
  that supports value assignment for toggle commands; older versions will toggle
  instead.

## Feedbacks

- Timer is active (running / running & time not up / running & time is up)
- Time is up
- Warn time reached
- Stageflow state is on (any display/message state)

## Variables

`combined`, `hours`, `minutes`, `seconds`, `currentTime`, `state`, `direction`,
`timeIsUp`, `warnTime`, `preparedMessage`, `preparedFullscreenMessage`, and one
`preset_N` variable per Stageflow preset.

## Notes

- Count-up timers start at the configured input time (not at 0). Use an input
  time of 0 for a plain stopwatch.
- The timer display is computed locally from the host-synchronized clock, so it
  stays accurate even though Stageflow only broadcasts on state changes.
