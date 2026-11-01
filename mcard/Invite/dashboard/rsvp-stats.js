// Pure calculation layer for the guest tracker. No DOM, no network.
// Every number on the dashboard comes from guests + RSVP replies + open tracking + the goal.

const norm = value => String(value ?? '').trim().toLowerCase();
const toInt = (value, fallback = 0) => {
  const n = Math.floor(Number(value));
  return Number.isFinite(n) && n >= 0 ? n : fallback;
};
const toTime = value => {
  const t = Date.parse(value);
  return Number.isFinite(t) ? t : 0;
};

export const STATUS_ORDER = ['attending', 'maybe', 'declined', 'seen', 'not_opened'];

// Maps any RSVP wording coming from the database to one of: attending | maybe | declined | null
export function classifyResponse(raw) {
  const s = norm(raw);
  if (!s || s === 'pending' || s === 'none' || s === 'no response') return null;
  if (/(declin|not attend|not coming|reject|^no$)/.test(s)) return 'declined';
  if (/(tentative|maybe|not sure|unsure|undecided)/.test(s)) return 'maybe';
  if (/(attend|accept|confirm|coming|^yes$)/.test(s)) return 'attending';
  return null;
}

// One state object per guest row.
// status: attending | maybe | declined | seen (opened, no reply) | not_opened
export function buildGuestStates(guests = [], rsvps = [], opens = {}) {
  const list = Array.isArray(guests) ? guests : [];
  const replies = Array.isArray(rsvps) ? rsvps : [];

  // Normalize open-tracking keys for case-insensitive lookup
  const normalizedOpens = new Map();
  if (opens && typeof opens === 'object') {
    for (const [code, data] of Object.entries(opens)) {
      if (code) normalizedOpens.set(norm(code), data);
    }
  }

  const nameCounts = new Map();
  for (const g of list) {
    const key = norm(g.guest_name);
    nameCounts.set(key, (nameCounts.get(key) || 0) + 1);
  }
  const byId = new Map();
  const byCode = new Map();
  const byUniqueName = new Map();
  for (const g of list) {
    if (g.id != null) byId.set(String(g.id), g);
    if (g.invite_code) byCode.set(norm(g.invite_code), g);
    const key = norm(g.guest_name);
    // A name is only a safe match key when exactly one guest has it.
    if (key && nameCounts.get(key) === 1) byUniqueName.set(key, g);
  }

  const latest = new Map();
  for (const reply of replies) {
    const guest =
      (reply.guest_id != null && byId.get(String(reply.guest_id))) ||
      (reply.invite_code && byCode.get(norm(reply.invite_code))) ||
      byUniqueName.get(norm(reply.guest_name));
    if (!guest) continue;
    const previous = latest.get(guest);
    if (!previous || toTime(reply.submitted_at) >= toTime(previous.submitted_at)) latest.set(guest, reply);
  }

  return list.map(guest => {
    const invited = Math.max(1, toInt(guest.family_members, 1));
    const reply = latest.get(guest) || null;
    const guestCodeKey = norm(guest.invite_code);
    const open = normalizedOpens.get(guestCodeKey) || (guest.invite_code && opens[guest.invite_code]) || {};
    const openCount = Math.max(toInt(open.open_count), toInt(guest.open_count));
    const firstOpenedAt = open.first_opened_at || guest.first_opened_at || null;
    const lastOpenedAt = open.last_opened_at || guest.last_opened_at || firstOpenedAt;
    const opened = openCount > 0 || Boolean(firstOpenedAt);

    let status = classifyResponse(reply && reply.status);
    let source = status ? 'rsvp' : null;
    if (!status) {
      status = classifyResponse(guest.rsvp_status_manual);
      if (status) source = 'manual';
    }

    const replyCount = reply ? toInt(reply.attending_count, -1) : -1;
    if (status === 'attending' && source === 'rsvp' && replyCount === 0) status = 'declined';
    if (!status) status = (opened || reply) ? 'seen' : 'not_opened';

    const people = { attending: 0, maybe: 0, declined: 0, seen: 0, not_opened: 0 };
    let invitedPeople = invited;
    let attendingNow = 0;
    if (status === 'attending') {
      attendingNow = source === 'rsvp' && replyCount > 0 ? replyCount : invited;
      invitedPeople = Math.max(invited, attendingNow);
      people.attending = attendingNow;
      people.declined = invitedPeople - attendingNow; // family members who are not attending
    } else {
      people[status] = invited;
    }

    return {
      guest,
      status,
      source,
      invitedPeople,
      attendingPeople: attendingNow,
      people,
      reply,
      replyAt: reply ? toTime(reply.submitted_at) : 0,
      opened,
      openCount,
      firstOpenedAt,
      lastOpenedAt,
      sent: Boolean(guest.invite_sent) || opened || Boolean(reply)
    };
  });
}

export function computeStats({ guests = [], rsvps = [], opens = {}, goal = 0 } = {}) {
  const states = buildGuestStates(guests, rsvps, opens);
  const people = { attending: 0, maybe: 0, declined: 0, seen: 0, not_opened: 0 };
  const invites = { attending: 0, maybe: 0, declined: 0, seen: 0, not_opened: 0 };
  let invitedPeople = 0;

  for (const state of states) {
    invitedPeople += state.invitedPeople;
    invites[state.status] += 1;
    for (const key of STATUS_ORDER) people[key] += state.people[key];
  }

  const invitations = states.length;
  const target = toInt(goal);
  const remaining = target ? Math.max(0, target - invitedPeople) : 0;
  const overBy = target && invitedPeople > target ? invitedPeople - target : 0;
  const repliedInvites = invites.attending + invites.maybe + invites.declined;
  const base = Math.max(target, invitedPeople);

  const segments = STATUS_ORDER.map(key => ({
    key,
    people: people[key],
    pct: base ? (people[key] / base) * 100 : 0
  }));
  if (target) segments.push({ key: 'remaining', people: remaining, pct: base ? (remaining / base) * 100 : 100 });

  return {
    states,
    goal: target,
    invitations,
    invitedPeople,
    remaining,
    overBy,
    people,
    invites,
    repliedInvites,
    replyRatePct: invitations ? Math.round((repliedInvites / invitations) * 100) : 0,
    confirmedPctOfGoal: target ? Math.round((people.attending / target) * 100) : null,
    seatsToPlan: people.attending + people.maybe,
    segments
  };
}