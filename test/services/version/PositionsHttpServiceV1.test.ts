let _ = require('lodash');
let async = require('async');
let restify = require('restify');
let assert = require('chai').assert;

import { ConfigParams } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { References } from 'pip-services3-commons-node';

import { ObjectPositionsV1 } from '../../../src/data/version1/ObjectPositionsV1';
import { PositionsMemoryPersistence } from '../../../src/persistence/PositionsMemoryPersistence';
import { PositionsController } from '../../../src/logic/PositionsController';
import { PositionsHttpServiceV1 } from '../../../src/services/version1/PositionsHttpServiceV1';

let httpConfig = ConfigParams.fromTuples(
    "connection.protocol", "http",
    "connection.host", "localhost",
    "connection.port", 3000
);

let now = new Date().getTime();
let interval = 300000;
let point1 = new Date(now);
let point2 = new Date(now + (interval / 2));
let point3 = new Date(now + interval);

suite('PositionsHttpServiceV1', ()=> {    
    let service: PositionsHttpServiceV1;
    let rest: any;

    suiteSetup((done) => {
        let persistence = new PositionsMemoryPersistence();
        let controller = new PositionsController();

        controller.configure(ConfigParams.fromTuples(
            'options.interval', 5 // Set interval to 5 mins
        ));

        service = new PositionsHttpServiceV1();
        service.configure(httpConfig);

        let references: References = References.fromTuples(
            new Descriptor('pip-services-positions', 'persistence', 'memory', 'default', '1.0'), persistence,
            new Descriptor('pip-services-positions', 'controller', 'default', 'default', '1.0'), controller,
            new Descriptor('pip-services-positions', 'service', 'http', 'default', '1.0'), service
        );
        controller.setReferences(references);
        service.setReferences(references);

        service.open(null, done);
    });
    
    suiteTeardown((done) => {
        service.close(null, done);
    });

    setup(() => {
        let url = 'http://localhost:3000';
        rest = restify.createJsonClient({ url: url, version: '*' });
    });
    
    
    test('CRUD Operations', (done) => {
        let position1: ObjectPositionsV1;

        async.series([
        // Create one position
            (callback) => {
                rest.post('/v1/positions/add_position',
                    {
                        org_id: '1', 
                        object_id: '1', 
                        time: point1, 
                        lat: 1, 
                        lng: 1
                    },
                    (err, req, res) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Create another position
            (callback) => {
                rest.post('/v1/positions/add_position',
                    {
                        org_id: '1', 
                        object_id: '1', 
                        time: point2, 
                        lat: 2, 
                        lng: 2
                    },
                    (err, req, res) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Create yet another position
            (callback) => {
                rest.post('/v1/positions/add_position',
                    {
                        org_id: '1', 
                        object_id: '1', 
                        time: point3, 
                        lat: 3, 
                        lng: 3
                    },
                    (err, req, res) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Get all positions
            (callback) => {
                rest.post('/v1/positions/get_positions',
                    {},
                    (err, req, res, page) => {
                        assert.isNull(err);

                        assert.isObject(page);
                        assert.lengthOf(page.data, 2);
                        assert.equal(page.data[0].positions.length + page.data[1].positions.length, 3);

                        callback();
                    }
                );
            },
        // Get positions count
            (callback) => {
                rest.post('/v1/positions/get_positions_count',
                    {},
                    (err, req, res, result) => {
                        assert.isNull(err);

                        assert.equal(result.count, 3);

                        callback();
                    }
                );
            },
        // Delete position
            (callback) => {
                rest.post('/v1/positions/delete_positions',
                    {},
                    (err, req, res) => {
                        assert.isNull(err);

                        callback();
                    }
                );
            },
        // Try to get delete positions
            (callback) => {
                rest.post('/v1/positions/get_positions',
                    {},
                    (err, req, res, page) => {
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