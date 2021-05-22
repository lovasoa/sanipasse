
import type { DBEvent } from '$lib/event';
import { get } from '$lib/http';
import { writable } from 'svelte/store';

export interface InvitedTo {
    eventId?: string;
    event?: DBEvent,
    promise: Promise<DBEvent | undefined>
}
function createInvitedToStore() {
    const eventId = globalThis?.location?.hash?.slice(1);
    const promise: Promise<DBEvent | undefined> =
        (eventId && typeof window === "object")
            ? get(`/api/publicevent-${eventId}/event.json`)
            : new Promise((accept) => { if (!eventId) accept(undefined) });
    const { subscribe, update } = writable<InvitedTo>({ eventId, promise });
    promise.then((event) => { update(invitedTo => ({ ...invitedTo, event })) })
    return { subscribe };
}

const invitedTo = createInvitedToStore();
export default invitedTo;