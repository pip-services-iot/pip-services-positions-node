import { Descriptor } from 'pip-services3-commons-node';
import { CommandableHttpService } from 'pip-services3-rpc-node';

export class PositionsHttpServiceV1 extends CommandableHttpService {
    public constructor() {
        super('v1/positions');
        this._dependencyResolver.put('controller', new Descriptor('pip-services-positions', 'controller', 'default', '*', '1.0'));
    }
}