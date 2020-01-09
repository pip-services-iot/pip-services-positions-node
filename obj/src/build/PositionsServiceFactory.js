"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_components_node_1 = require("pip-services3-components-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const PositionsMongoDbPersistence_1 = require("../persistence/PositionsMongoDbPersistence");
const PositionsFilePersistence_1 = require("../persistence/PositionsFilePersistence");
const PositionsMemoryPersistence_1 = require("../persistence/PositionsMemoryPersistence");
const PositionsController_1 = require("../logic/PositionsController");
const PositionsHttpServiceV1_1 = require("../services/version1/PositionsHttpServiceV1");
class PositionsServiceFactory extends pip_services3_components_node_1.Factory {
    constructor() {
        super();
        this.registerAsType(PositionsServiceFactory.MemoryPersistenceDescriptor, PositionsMemoryPersistence_1.PositionsMemoryPersistence);
        this.registerAsType(PositionsServiceFactory.FilePersistenceDescriptor, PositionsFilePersistence_1.PositionsFilePersistence);
        this.registerAsType(PositionsServiceFactory.MongoDbPersistenceDescriptor, PositionsMongoDbPersistence_1.PositionsMongoDbPersistence);
        this.registerAsType(PositionsServiceFactory.ControllerDescriptor, PositionsController_1.PositionsController);
        this.registerAsType(PositionsServiceFactory.HttpServiceDescriptor, PositionsHttpServiceV1_1.PositionsHttpServiceV1);
    }
}
exports.PositionsServiceFactory = PositionsServiceFactory;
PositionsServiceFactory.Descriptor = new pip_services3_commons_node_1.Descriptor("pip-services-positions", "factory", "default", "default", "1.0");
PositionsServiceFactory.MemoryPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-positions", "persistence", "memory", "*", "1.0");
PositionsServiceFactory.FilePersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-positions", "persistence", "file", "*", "1.0");
PositionsServiceFactory.MongoDbPersistenceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-positions", "persistence", "mongodb", "*", "1.0");
PositionsServiceFactory.ControllerDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-positions", "controller", "default", "*", "1.0");
PositionsServiceFactory.HttpServiceDescriptor = new pip_services3_commons_node_1.Descriptor("pip-services-positions", "service", "http", "*", "1.0");
//# sourceMappingURL=PositionsServiceFactory.js.map