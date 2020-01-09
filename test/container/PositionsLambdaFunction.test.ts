let _ = require('lodash');
let async = require('async');
let assert = require('chai').assert;

import { Descriptor } from 'pip-services3-commons-node';
import { ConfigParams } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';
import { ConsoleLogger } from 'pip-services3-components-node';

import { ObjectPositionsV1 } from '../../src/data/version1/ObjectPositionsV1';
import { PositionsMemoryPersistence } from '../../src/persistence/PositionsMemoryPersistence';
import { PositionsController } from '../../src/logic/PositionsController';
import { PositionsLambdaFunction } from '../../src/container/PositionsLambdaFunction';

let now = new Date().getTime();
let interval = 300000;
let point1 = new Date(now);
let point2 = new Date(now + (interval / 2));
let point3 = new Date(now + interval);

suite('PositionsLambdaFunction', ()=> {
    let lambda: PositionsLambdaFunction;

    suiteSetup((done) => {
        let config = ConfigParams.fromTuples(
            'logger.descriptor', 'pip-services:logger:console:default:1.0',
            'persistence.descriptor', 'pip-services-positions:persistence:memory:default:1.0',
            'controller.descriptor', 'pip-services-positions:controller:default:default:1.0'
        );

        lambda = new PositionsLambdaFunction();
        lambda.configure(config);
        lambda.open(null, done);
    });
    
    suiteTeardown((done) => {
        lambda.close(null, done);
    });
    
    test('CRUD Operations', (done) => {
        let position1: ObjectPositionsV1;

        async.series([
        // Create one position
            (callback) => {
                lambda.act(
                    {
                        cmd: 'add_position',
                        org_id: '1', 
                        object_id: '1', 
                        time: point1, 
                        lat: 1, 
                        lng: 1
                    },
                    (err, result) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Create another position
            (callback) => {
                lambda.act(
                    {
                        cmd: 'add_position',
                        org_id: '1', 
                        object_id: '1', 
                        time: point2, 
                        lat: 2, 
                        lng: 2
                    },
                    (err, result) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Create yet another position
            (callback) => {
                lambda.act(
                    {
                        cmd: 'add_position',
                        org_id: '1', 
                        object_id: '1', 
                        time: point3, 
                        lat: 3, 
                        lng: 3
                    },
                    (err, result) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Get all positions
            (callback) => {
                lambda.act(
                    {
                        cmd: 'get_positions',
                    },
                    (err, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.isTrue(page.data.length >= 1);

                        callback();
                    }
                );
            },
        // Get positions count
            (callback) => {
                lambda.act(
                    {
                        cmd: 'get_positions_count',
                    },
                    (err, result) => {
                        assert.isNull(err);

                        assert.equal(result.count, 3);

                        callback();
                    }
                );
            },
        // Delete position
            (callback) => {
                lambda.act(
                    {
                        cmd: 'delete_positions',
                    },
                    (err, result) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Try to get delete positions
            (callback) => {
                lambda.act(
                    {
                        cmd: 'get_positions',
                    },
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