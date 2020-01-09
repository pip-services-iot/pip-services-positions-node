import { Benchmark } from 'pip-benchmark-node';
export declare class AddMongoDbPositionsBenchmark extends Benchmark {
    private _initialRecordNumber;
    private _organizationNumber;
    private _objectNumber;
    private _startTime;
    private _interval;
    private _orgId;
    private _objectId;
    private _time;
    private _persistence;
    private _controller;
    constructor();
    setUp(callback: (err: any) => void): void;
    tearDown(callback: (err: any) => void): void;
    private nextObject;
    private getRandomCoord;
    private getRandomSpeed;
    private getRandomAlt;
    private getRandomAngle;
    execute(callback: (err: any) => void): void;
}
