"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_aws_node_1 = require("pip-services3-aws-node");
const PositionsServiceFactory_1 = require("../build/PositionsServiceFactory");
class PositionsLambdaFunction extends pip_services3_aws_node_1.CommandableLambdaFunction {
    constructor() {
        super("positions", "Object positions function");
        this._dependencyResolver.put('controller', new pip_services3_commons_node_1.Descriptor('pip-services-positions', 'controller', 'default', '*', '*'));
        this._factories.add(new PositionsServiceFactory_1.PositionsServiceFactory());
    }
}
exports.PositionsLambdaFunction = PositionsLambdaFunction;
exports.handler = new PositionsLambdaFunction().getHandler();
//# sourceMappingURL=PositionsLambdaFunction.js.map