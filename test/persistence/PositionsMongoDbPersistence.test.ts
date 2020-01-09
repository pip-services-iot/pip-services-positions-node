let process = require('process');
import { ConfigParams } from 'pip-services3-commons-node';

import { PositionsMongoDbPersistence } from '../../src/persistence/PositionsMongoDbPersistence';
import { PositionsPersistenceFixture } from './PositionsPersistenceFixture';

suite('PositionsMongoDbPersistence', ()=> {
    let persistence: PositionsMongoDbPersistence;
    let fixture: PositionsPersistenceFixture;

    setup((done) => {
        var MONGO_DB = process.env["MONGO_DB"] || "test";
        var MONGO_COLLECTION = process.env["MONGO_COLLECTION"] || "positions";
        var MONGO_SERVICE_HOST = process.env["MONGO_SERVICE_HOST"] || "localhost";
        var MONGO_SERVICE_PORT = process.env["MONGO_SERVICE_PORT"] || "27017";
        var MONGO_SERVICE_URI = process.env["MONGO_SERVICE_URI"];

        var dbConfig = ConfigParams.fromTuples(
            "collection", MONGO_COLLECTION,
            "connection.database", MONGO_DB,
            "connection.host", MONGO_SERVICE_HOST,
            "connection.port", MONGO_SERVICE_PORT,
            "connection.uri", MONGO_SERVICE_URI
        );

        persistence = new PositionsMongoDbPersistence();
        persistence.configure(dbConfig);

        fixture = new PositionsPersistenceFixture(persistence);

        persistence.open(null, (err: any) => {
            if (err == null) {
                persistence.clear(null, (err) => {
                    done(err);
                });
            } else {
                done(err);
            }
        });
    });
    
    teardown((done) => {
        persistence.close(null, done);
    });

    test('CRUD Operations', (done) => {
        fixture.testCrudOperations(done);
    });

    test('Get with Filters', (done) => {
        fixture.testGetWithFilter(done);
    });

    test('Filter Positions', (done) => {
        fixture.testFilterPositions(done);
    });
    
});