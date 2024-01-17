import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter'; //new


@Injectable()
export class EventbusService {
    constructor(private eventEmitter: EventEmitter2) { }

    subscribe(eventType: string, listener: (data: any) => void): void {
        this.eventEmitter.on(eventType, listener);
    }

    publish(eventType: string, data: object): void {
        this.eventEmitter.emit(eventType, data);
    }
}
