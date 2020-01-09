import { IReferences } from 'pip-services3-commons-node';
import { ProcessContainer } from 'pip-services3-container-node';
import { DefaultRpcFactory } from 'pip-services3-rpc-node';

import { PositionsServiceFactory } from '../build/PositionsServiceFactory';

export class PositionsProcess extends ProcessContainer {

    public constructor() {
        super("positions", "Object positions microservice");
        this._factories.add(new PositionsServiceFactory);
        this._factories.add(new DefaultRpcFactory);
    }

}
