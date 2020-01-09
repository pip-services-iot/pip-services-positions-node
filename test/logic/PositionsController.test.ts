let _ = require('lodash');
let async = require('async');
let restify = require('restify');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';

import { ObjectPositionsV1 } from '../../src/data/version1/ObjectPositionsV1';
import { PositionsMemoryPersistence } from '../../src/persistence/PositionsMemoryPersistence';
import { PositionsController } from '../../src/logic/PositionsController';

let now = new Date().getTime();
let interval = 300000;
let point1 = new Date(now);
let point2 = new Date(now + (interval / 2));
let point3 = new Date(now + interval);

suite('PositionsControllerV1', ()=> {    
    let persistence: PositionsMemoryPersistence;
    let controller: PositionsController;

    suiteSetup(() => {
        persistence = new PositionsMemoryPersistence();
        controller = new PositionsController();

        controller.configure(ConfigParams.fromTuples(
            'options.interval', 5 // Set interval to 5 mins
        ));

        let references: References = References.fromTuples(
            new Descriptor('pip-services-positions', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-positions', 'controller', 'default', 'default', '1.0'), controller
        );
        controller.setReferences(references);
    });
    
    setup((done) => {
        persistence.clear(null, done);
    });
    
    
    test('CRUD Operations', (done) => {
        let position1: ObjectPositionsV1;

        async.series([
        // Create one position
            (callback) => {
                controller.addPosition(
                    null,
                    '1', '1', point1, 1, 1, null, null, null,
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Create other positions
            (callback) => {
                controller.addPositions(
                    null, 
                    [
                        { org_id: '1', object_id: '1', time: point2, lat: 2, lng: 2, alt: null, angle: null, speed: null },
                        { org_id: '1', object_id: '1', time: point3, lat: 3, lng: 3, alt: null, angle: null, speed: null }
                    ],
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Get all positions
            (callback) => {
                controller.getPositions(
                    null,
                    null,
                    null,
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);
                        assert.equal(page.data[0].positions.length + page.data[1].positions.length, 3);

                        callback();
                    }
                );
            },
        // Get timeline positions
            (callback) => {
                controller.getTimelinePositions(
                    null,
                    point2,
                    null,
                    (err, positions) => {
                        assert.isNull(err);

                        assert.isArray(positions);
                        assert.lengthOf(positions, 1);

                        let position = positions[0];
                        assert.equal(position.org_id, '1');
                        assert.equal(position.object_id, '1');
                        
                        callback();
                    }
                );
            },
        // Get positions count
            (callback) => {
                controller.getPositionsCount(
                    null,
                    null,
                    (err, count) => {
                        assert.isNull(err);

                        assert.equal(count, 3);

                        callback();
                    }
                );
            },
        // Delete position
            (callback) => {
                controller.deletePositions(
                    null,
                    null,
                    (err) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Try to get delete positions
            (callback) => {
                controller.getPositions(
                    null,
                    null,
                    null,
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 0);

                        callback();
                    }
                );
            }
        ], done);
    });
});