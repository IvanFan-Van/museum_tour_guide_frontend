import { MinPriorityQueue } from "@datastructures-js/priority-queue";

interface Task<Data, Result> {
    data: Data;
    priority: number;
    resolve: (result: Result) => void;
    reject: (error: any) => void;
}

export class WorkerPool<Data, Result> {
    private workerScript: URL;
    private idleWorkers = new MinPriorityQueue<{ id: number; worker: Worker }>(
        (item) => item.id
    );
    private activeWorkers: Map<Worker, Task<Data, Result>> = new Map();
    private taskQueue = new MinPriorityQueue<Task<Data, Result>>(
        (task) => task.priority
    );

    constructor(
        workerScriptURL: URL,
        poolSize: number = navigator.hardwareConcurrency
    ) {
        this.workerScript = workerScriptURL;
        this.initializePool(poolSize);
    }

    private initializePool(size: number): void {
        for (let i = 0; i < size; i++) {
            // 创建 worker
            const worker = new Worker(this.workerScript, { type: "module" });
            console.log(`创建 [线程 ${i + 1}]`);
            worker.onmessage = (event: MessageEvent<Result>) => {
                this.onWorkerFinished(i + 1, worker, event.data, null);
            };
            worker.onerror = (error: ErrorEvent) => {
                this.onWorkerFinished(i + 1, worker, null, error);
            };
            this.idleWorkers.enqueue({ id: i + 1, worker: worker });
        }
    }

    // 任务分配循环
    private dispatch(): void {
        if (this.idleWorkers.size() > 0 && !this.taskQueue.isEmpty()) {
            const workerItem = this.idleWorkers.dequeue();
            if (!workerItem) {
                return;
            }
            const { id, worker } = workerItem;
            const task = this.taskQueue.dequeue();
            if (!task) {
                return;
            }

            console.log(`[生产者 ${id}] 正在生产 [任务 ${task.priority}]`);
            this.activeWorkers.set(worker, task);
            worker.postMessage(task.data);
        }
    }

    private onWorkerFinished(
        id: number,
        worker: Worker,
        result: Result | null,
        error: any
    ): void {
        const task = this.activeWorkers.get(worker);

        if (!task) return;

        console.log(`[线程 ${id}] 完成 [任务 ${task.priority}]`);

        if (error) {
            console.log(`[线程 ${id}] 发生错误: ${error}`);
            task.reject(error);
        } else {
            if (result) {
                task.resolve(result);
            }
        }

        this.activeWorkers.delete(worker); // 从正在执行的队列中删除该 worker
        this.idleWorkers.enqueue({ id, worker }); // 将其添加到空闲队列中

        this.dispatch();
    }

    public terminate(): void {
        this.taskQueue.clear();
        for (const { worker } of this.idleWorkers) {
            worker.terminate();
        }
        for (const worker of this.activeWorkers.keys()) {
            worker.terminate();
        }
        this.idleWorkers.clear();
        this.activeWorkers.clear();
    }

    /**
     * 提交一个任务到池中执行
     * @param data 发送给 worker 的数据
     * @param priority 任务优先级 (数字越小，优先级越高)
     * @returns 一个在任务完成时解析的 Promise
     */
    public run(data: Data, priority: number = 0): Promise<Result> {
        return new Promise((resolve, reject) => {
            this.taskQueue.enqueue({ data, priority, resolve, reject });
            this.dispatch();
        });
    }

    public async completed(): Promise<void> {
        while (!this.taskQueue.isEmpty() || this.activeWorkers.size > 0) {
            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }
}
