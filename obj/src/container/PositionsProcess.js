"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_container_node_1 = require("pip-services3-container-node");
const pip_services3_rpc_node_1 = require("pip-services3-rpc-node");
const PositionsServiceFactory_1 = require("../build/PositionsServiceFactory");
class PositionsProcess extends pip_services3_container_node_1.ProcessContainer {
    constructor() {
        super("positions", "Object positions microservice");
        this._factories.add(new PositionsServiceFactory_1.PositionsServiceFactory);
        this._factories.add(new pip_services3_rpc_node_1.DefaultRpcFactory);
    }
}
exports.PositionsProcess = PositionsProcess;
//# sourceMappingURL=PositionsProcess.js.map