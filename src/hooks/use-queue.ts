import { useRef } from "react";

class Queue<T> {
    items: T[];
    waitingResolvers: ((value: T) => void)[];

    constructor() {
        this.items = [];
        this.waitingResolvers = [];
    }

    put(item: T) {
        if (this.waitingResolvers.length > 0) {
            const resolver = this.waitingResolvers.shift()!;
            resolver(item);
        } else {
            this.items.push(item);
        }
    }

    async get(): Promise<T> {
        return new Promise<T>((resolve) => {
            if (this.items.length > 0) {
                const item = this.items.shift()!;
                resolve(item);
            } else {
                this.waitingResolvers.push(resolve);
            }
        });
    }

    empty() {
        this.items = [];
        this.waitingResolvers = [];
    }
}

export default function useQueue<T>() {
    const queueRef = useRef<Queue<T>>(new Queue<T>());

    const put = (item: T) => {
        queueRef.current.put(item);
    };

    const get = async () => {
        return await queueRef.current.get();
    };

    const empty = () => {
        queueRef.current.empty();
    };

    return { put, get, empty };
}
