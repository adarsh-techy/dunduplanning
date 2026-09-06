// Shared mapping from the Dundu-Online launch plan's 5-state status
// (Built / Partial / Needs Fix / To Decide / Not Started) onto our 3-state
// checklist status. Where the original label carries information the
// 3-state model loses (Partial, Needs Fix, To Decide), it's kept as a
// "[Label]" prefix wherever the note text is shown.
export const LAUNCH_STATUS_MAP = {
  Built: 'complete',
  Partial: 'in_progress',
  'Needs Fix': 'in_progress',
  'To Decide': 'pending',
  'Not Started': 'pending',
};

export const withLaunchStatusPrefix = (label, text) =>
  label === 'Built' || label === 'Not Started' ? text : `[${label}] ${text}`.trim();
