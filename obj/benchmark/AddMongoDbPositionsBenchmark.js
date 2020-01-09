"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_benchmark_node_1 = require("pip-benchmark-node");
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const PositionsMongoDbPersistence_1 = require("../src/persistence/PositionsMongoDbPersistence");
const PositionsController_1 = require("../src/logic/PositionsController");
class AddMongoDbPositionsBenchmark extends pip_benchmark_node_1.Benchmark {
    constructor() {
        super("AddMongoDbPositions", "Measures performance of adding positions into MongoDB database");
    }
    setUp(callback) {
        this._initialRecordNumber = this.context.parameters.InitialRecordNumber.getAsInteger();
        this._organizationNumber = this.context.parameters.SiteNumber.getAsInteger();
        this._objectNumber = this.context.parameters.ObjectNumber.getAsInteger();
        this._startTime = pip_services3_commons_node_1.DateTimeConverter.toDateTime(this.context.parameters.StartTime.getAsString());
        this._interval = this.context.parameters.Interval.getAsInteger();
        this._time = this._startTime;
        this._orgId = 1;
        this._objectId = 1;
        let mongoUri = this.context.parameters.MongoUri.getAsString();
        let mongoHost = this.context.parameters.MongoHost.getAsString();
        let mongoPort = this.context.parameters.MongoPort.getAsInteger();
        let mongoDb = this.context.parameters.MongoDb.getAsString();
        this._persistence = new PositionsMongoDbPersistence_1.PositionsMongoDbPersistence();
        this._persistence.configure(pip_services3_commons_node_2.ConfigParams.fromTuples('connection.uri', mongoUri, 'connection.host', mongoHost, 'connection.port', mongoPort, 'connection.database', mongoDb));
        this._controller = new PositionsController_1.PositionsController();
        this._controller.configure(pip_services3_commons_node_2.ConfigParams.fromTuples('options.interval', 5 // Set interval to 5 mins
        ));
        let references = pip_services3_commons_node_4.References.fromTuples(new pip_services3_commons_node_3.Descriptor('pip-services-positions', 'persistence', 'mongodb', 'default', '1.0'), this._persistence, new pip_services3_commons_node_3.Descriptor('pip-services-positions', 'controller', 'default', 'default', '1.0'), this._controller);
        this._controller.setReferences(references);
        this._persistence.open(null, (err) => {
            if (err == null)
                this.context.sendMessage('Connected to mongodb database');
            callback(err);
        });
    }
    tearDown(callback) {
        this._persistence.close(null, (err) => {
            this.context.sendMessage('Disconnected from mongodb database');
            callback(err);
        });
        this._persistence = null;
        this._controller = null;
    }
    nextObject() {
        this._objectId++;
        if (this._objectId > this._objectNumber) {
            this._objectId = 1;
            this._orgId++;
            if (this._orgId > this._organizationNumber) {
                this._orgId = 1;
                this._time = new Date(this._time.getTime() + this._interval);
                console.log('Time ' + this._time);
            }
        }
    }
    getRandomCoord() {
        return Math.random() * 360 - 180;
    }
    getRandomSpeed() {
        return Math.random() * 100;
    }
    getRandomAlt() {
        return Math.random() * 100;
    }
    getRandomAngle() {
        return Math.random() * 360;
    }
    // public execute(callback: (err: any) => void): void {
    //     this._controller.addPosition(
    //         null, this._orgId.toString(), this._objectId.toString(),
    //         this._time, this.getRandomCoord(), this.getRandomCoord(),
    //         this.getRandomAlt(), this.getRandomSpeed(), this.getRandomAngle(), 
    //         (err) => {
    //             this.nextObject();
    //             callback(err);
    //         }
    //     );
    // }
    execute(callback) {
        let positions = [];
        for (let orgId = 1; orgId <= this._organizationNumber; orgId++) {
            for (let objectId = 1; objectId <= this._objectNumber; objectId++) {
                positions.push({
                    org_id: orgId.toString(),
                    object_id: objectId.toString(),
                    time: this._time,
                    lat: this.getRandomCoord(),
                    lng: this.getRandomCoord(),
                    alt: this.getRandomAlt(),
                    speed: this.getRandomSpeed(),
                    angle: this.getRandomAngle()
                });
            }
        }
        this._time = new Date(this._time.getTime() + this._interval);
        this._controller.addPositions(null, positions, callback);
    }
}
exports.AddMongoDbPositionsBenchmark = AddMongoDbPositionsBenchmark;
//# sourceMappingURL=AddMongoDbPositionsBenchmark.js.map