let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { ObjectPositionsV1 } from '../../src/data/version1/ObjectPositionsV1';

import { IPositionsPersistence } from '../../src/persistence/IPositionsPersistence';

let now = new Date().getTime();
let interval = 300000;
let time1 = new Date(now);
let time2 = new Date(now + interval);
let time3 = new Date(now + 2 * interval);
let point1 = new Date(now);
let point2 = new Date(now + (interval / 2));
let point3 = new Date(now + interval);

export class PositionsPersistenceFixture {
    private _persistence: IPositionsPersistence;
    
    constructor(persistence) {
        assert.isNotNull(persistence);
        this._persistence = persistence;
    }

    private testAddPositions(done) {
        async.series([
        // Create one position
            // (callback) => {
            //     this._persistence.addOne(
            //         null,
            //         '1', '1', time1, time2, point1, 1, 1, 0, 10, 45,
            //         (err) => {
            //             assert.isNull(err);

            //             callback();
            //         }
            //     );
            // },
        // Create another position
            (callback) => {
                this._persistence.addBatch(
                    null,
                    [
                        { org_id: '1', object_id: '1', start_time: time1, end_time: time2, time: point1, lat: 1, lng: 1, alt: 0, speed: 10, angle: 45 },
                        { org_id: '1', object_id: '1', start_time: time1, end_time: time2, time: point2, lat: 2, lng: 2, alt: null, speed: null, angle: null },
                        { org_id: '1', object_id: '1', start_time: time2, end_time: time3, time: point3, lat: 3, lng: 3, alt: null, speed: null, angle: null },
                        { org_id: '2', object_id: '2', start_time: time1, end_time: time2, time: point1, lat: 10, lng: 10, alt: null, speed: null, angle: null }
                    ],
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // // Create another position
        // (callback) => {
        //     this._persistence.addOne(
        //         null,
        //         '1', '1', time1, time2, point2, 2, 2, null, null, null,
        //         (err) => {
        //             assert.isNull(err);

        //             callback();
        //         }
        //     );
        // },
    // // Create yet another position
        //     (callback) => {
        //         this._persistence.addOne(
        //             null,
        //             '1', '1', time2, time3, point3, 3, 3, null, null, null,
        //             (err) => {
        //                 assert.isNull(err);

        //                 callback();
        //             }
        //         );
        //     },
        // // Create position for another object
        //     (callback) => {
        //         this._persistence.addOne(
        //             null,
        //             '2', '2', time1, time2, point1, 10, 10, null, null, null,
        //             (err) => {
        //                 assert.isNull(err);

        //                 callback();
        //             }
        //         );
        //     }
        ], done);
    }
                
    public testCrudOperations(done) {
        let position1: ObjectPositionsV1;

        async.series([
        // Create items
            (callback) => {
                this.testAddPositions(callback);
            },
        // Get all positions
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    new FilterParams(),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 3);

                        position1 = page.data[0];

                        callback();
                    }
                );
            },
        // Calculate number of points
            (callback) => {
                this._persistence.getCount(
                    null,
                    new FilterParams(),
                    (err, count) => {
                        assert.isNull(err);

                        assert.equal(count, 4);

                        callback();
                    }
                );
            },
        // Delete position
            (callback) => {
                this._persistence.deleteByFilter(
                    null,
                    FilterParams.fromTuples('object_id', '1'),
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Try to get delete positions
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    new FilterParams(),
                    new PagingParams(),
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 1);

                        callback();
                    }
                );
            }
        ], done);
    }

    public testGetWithFilter(done) {
        async.series([
        // Create positions
            (callback) => {
                this.testAddPositions(callback);
            },
        // Get positions filtered by organization
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        org_id: '1'
                    }),
                    new PagingParams(),
                    (err, positions) => {
                        assert.isNull(err);

                        assert.isObject(positions);
                        assert.lengthOf(positions.data, 2);

                        callback();
                    }
                );
            },
        // Get positions by object_ids
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        object_ids: '2'
                    }),
                    new PagingParams(),
                    (err, positions) => {
                        assert.isNull(err);

                        assert.isObject(positions);
                        assert.lengthOf(positions.data, 1);

                        callback();
                    }
                );
            },
        // Get positions filtered time
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        from_time: time1,
                        to_time: time2
                    }),
                    new PagingParams(),
                    (err, positions) => {
                        assert.isNull(err);

                        assert.isObject(positions);
                        assert.lengthOf(positions.data, 2);

                        callback();
                    }
                );
            },
        ], done);
    }

    public testFilterPositions(done) {
        let startTicks = new Date(2017, 1, 1, 0, 0, 0).getTime();

        async.series([
        // Create positions
            (callback) => {
                let startTime = new Date(startTicks);
                let endTime = new Date(startTicks + 15 * 60000);

                let times = [];
                for (let i = 0; i < 10; i++)
                    times.push(new Date(startTicks + i * 5000));

                async.each(times, (time, callback) => {
                    this._persistence.addOne(
                        null,
                        '1', '1', startTime, endTime, time, 1, 1, 0, 0, 0,
                        callback
                    )
                }, callback);
            },
        // Get positions filtered by organization
            (callback) => {
                this._persistence.getPageByFilter(
                    null,
                    FilterParams.fromValue({
                        org_id: '1',
                        object_id: '1',
                        from_time: new Date(startTicks),
                        to_time: new Date(startTicks + 3 * 5000)
                    }),
                    new PagingParams(),
                    (err, positions) => {
                        assert.isNull(err);

                        assert.isObject(positions);
                        //assert.lengthOf(positions.data, 1);

                        let data = positions.data[0];
                        // assert.lengthOf(data.positions, 3);
                        assert.isTrue(data.positions.length >= 1);

                        callback();
                    }
                );
            }
        ], done);
    }
    
}
