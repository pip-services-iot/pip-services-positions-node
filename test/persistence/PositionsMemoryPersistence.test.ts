import { ConfigParams } from 'pip-services3-commons-node';

import { PositionsMemoryPersistence } from '../../src/persistence/PositionsMemoryPersistence';
import { PositionsPersistenceFixture } from './PositionsPersistenceFixture';

suite('PositionsMemoryPersistence', ()=> {
    let persistence: PositionsMemoryPersistence;
    let fixture: PositionsPersistenceFixture;
    
    setup((done) => {
        persistence = new PositionsMemoryPersistence();
        persistence.configure(new ConfigParams());
        
        fixture = new PositionsPersistenceFixture(persistence);
        
        persistence.open(null, done);
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