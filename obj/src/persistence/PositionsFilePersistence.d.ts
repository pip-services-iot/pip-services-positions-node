import { ConfigParams } from 'pip-services3-commons-node';
import { JsonFilePersister } from 'pip-services3-data-node';
import { PositionsMemoryPersistence } from './PositionsMemoryPersistence';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';
export declare class PositionsFilePersistence extends PositionsMemoryPersistence {
    protected _persister: JsonFilePersister<ObjectPositionsV1>;
    constructor(path?: string);
    configure(config: ConfigParams): void;
}
