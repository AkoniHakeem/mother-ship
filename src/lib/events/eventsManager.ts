import Emittery from 'emittery';
import { EventTypes } from '../enums/eventTypes';
export class EventsManager {
  static registeredEvents: EmitteryEvent<Record<string, unknown>>[];

  static getEvent<T extends EventData>(eventName: EventTypes): Emittery<T> {
    if (!EventsManager.registeredEvents) EventsManager.registeredEvents = [];
    let eventInStore = EventsManager.registeredEvents.find((e) => e.name === eventName) as EmitteryEvent<T>;
    if (!eventInStore) {
      eventInStore = new EmitteryEvent<T>();
      eventInStore.name = eventName;
      EventsManager.registeredEvents.push(eventInStore as EmitteryEvent<Record<string, unknown>>);
    }

    return eventInStore as Emittery<T>;
  }
}

class EmitteryEvent<T extends EventData> extends Emittery<T> {
  name: EventTypes;
}

interface EventData {
  [key: string]: unknown;
}
