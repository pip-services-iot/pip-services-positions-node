import { Factory } from 'pip-services3-components-node';
import { Descriptor } from 'pip-services3-commons-node';

import { PositionsMongoDbPersistence } from '../persistence/PositionsMongoDbPersistence';
import { PositionsFilePersistence } from '../persistence/PositionsFilePersistence';
import { PositionsMemoryPersistence } from '../persistence/PositionsMemoryPersistence';
import { PositionsController } from '../logic/PositionsController';
import { PositionsHttpServiceV1 } from '../services/version1/PositionsHttpServiceV1';

export class PositionsServiceFactory extends Factory {
	public static Descriptor = new Descriptor("pip-services-positions", "factory", "default", "default", "1.0");
	public static MemoryPersistenceDescriptor = new Descriptor("pip-services-positions", "persistence", "memory", "*", "1.0");
	public static FilePersistenceDescriptor = new Descriptor("pip-services-positions", "persistence", "file", "*", "1.0");
	public static MongoDbPersistenceDescriptor = new Descriptor("pip-services-positions", "persistence", "mongodb", "*", "1.0");
	public static ControllerDescriptor = new Descriptor("pip-services-positions", "controller", "default", "*", "1.0");
	public static HttpServiceDescriptor = new Descriptor("pip-services-positions", "service", "http", "*", "1.0");
	
	constructor() {
		super();
		this.registerAsType(PositionsServiceFactory.MemoryPersistenceDescriptor, PositionsMemoryPersistence);
		this.registerAsType(PositionsServiceFactory.FilePersistenceDescriptor, PositionsFilePersistence);
		this.registerAsType(PositionsServiceFactory.MongoDbPersistenceDescriptor, PositionsMongoDbPersistence);
		this.registerAsType(PositionsServiceFactory.ControllerDescriptor, PositionsController);
		this.registerAsType(PositionsServiceFactory.HttpServiceDescriptor, PositionsHttpServiceV1);
	}
	
}
