import { Descriptor } from 'pip-services3-commons-node';
import { CommandableLambdaFunction } from 'pip-services3-aws-node';
import { PositionsServiceFactory } from '../build/PositionsServiceFactory';

export class PositionsLambdaFunction extends CommandableLambdaFunction {
    public constructor() {
        super("positions", "Object positions function");
        this._dependencyResolver.put('controller', new Descriptor('pip-services-positions', 'controller', 'default', '*', '*'));
        this._factories.add(new PositionsServiceFactory());
    }
}

export const handler = new PositionsLambdaFunction().getHandler();