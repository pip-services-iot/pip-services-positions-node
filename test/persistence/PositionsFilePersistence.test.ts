import { ConfigParams } from 'pip-services3-commons-node';

import { PositionsFilePersistence } from '../../src/persistence/PositionsFilePersistence';
import { PositionsPersistenceFixture } from './PositionsPersistenceFixture';

suite('PositionsFilePersistence', ()=> {
    let persistence: PositionsFilePersistence;
    let fixture: PositionsPersistenceFixture;
    
    setup((done) => {
        persistence = new PositionsFilePersistence('./data/positions.test.json');

        fixture = new PositionsPersistenceFixture(persistence);

        persistence.open(null, (err) => {
            persistence.clear(null, done);
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