"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const pip_services3_commons_node_6 = require("pip-services3-commons-node");
const pip_services3_commons_node_7 = require("pip-services3-commons-node");
const pip_services3_commons_node_8 = require("pip-services3-commons-node");
const pip_services3_commons_node_9 = require("pip-services3-commons-node");
const pip_services3_commons_node_10 = require("pip-services3-commons-node");
const ObjectPositionV1Schema_1 = require("../data/version1/ObjectPositionV1Schema");
class PositionsCommandSet extends pip_services3_commons_node_1.CommandSet {
    constructor(logic) {
        super();
        this._logic = logic;
        // Register commands to the database
        this.addCommand(this.makeGetPositionsCommand());
        this.addCommand(this.makeGetTimelinePositionsCommand());
        this.addCommand(this.makeGetPositionsCountCommand());
        this.addCommand(this.makeAddPositionCommand());
        this.addCommand(this.makeAddPositionsCommand());
        this.addCommand(this.makeDeletePositionsCommand());
    }
    makeGetPositionsCommand() {
        return new pip_services3_commons_node_2.Command("get_positions", new pip_services3_commons_node_5.ObjectSchema(true)
            .withOptionalProperty('filter', new pip_services3_commons_node_8.FilterParamsSchema())
            .withOptionalProperty('paging', new pip_services3_commons_node_9.PagingParamsSchema()), (correlationId, args, callback) => {
            let filter = pip_services3_commons_node_3.FilterParams.fromValue(args.get("filter"));
            let paging = pip_services3_commons_node_4.PagingParams.fromValue(args.get("paging"));
            this._logic.getPositions(correlationId, filter, paging, callback);
        });
    }
    makeGetTimelinePositionsCommand() {
        return new pip_services3_commons_node_2.Command("get_timeline_positions", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty('time', null) // TypeCode.Date)
            .withOptionalProperty('filter', new pip_services3_commons_node_8.FilterParamsSchema()), (correlationId, args, callback) => {
            let time = pip_services3_commons_node_10.DateTimeConverter.toDateTime(args.get("time"));
            let filter = pip_services3_commons_node_3.FilterParams.fromValue(args.get("filter"));
            this._logic.getTimelinePositions(correlationId, time, filter, callback);
        });
    }
    makeGetPositionsCountCommand() {
        return new pip_services3_commons_node_2.Command("get_positions_count", new pip_services3_commons_node_5.ObjectSchema(true)
            .withOptionalProperty('filter', new pip_services3_commons_node_8.FilterParamsSchema()), (correlationId, args, callback) => {
            let filter = pip_services3_commons_node_3.FilterParams.fromValue(args.get("filter"));
            this._logic.getPositionsCount(correlationId, filter, (err, count) => {
                let result = err == null && count != null ? { count: count } : null;
                callback(err, result);
            });
        });
    }
    makeAddPositionCommand() {
        return new pip_services3_commons_node_2.Command("add_position", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty('org_id', pip_services3_commons_node_7.TypeCode.String)
            .withRequiredProperty('object_id', pip_services3_commons_node_7.TypeCode.String)
            .withRequiredProperty('time', null) //TypeCode.Date)
            .withRequiredProperty('lat', pip_services3_commons_node_7.TypeCode.Float)
            .withRequiredProperty('lng', pip_services3_commons_node_7.TypeCode.Float)
            .withOptionalProperty('alt', pip_services3_commons_node_7.TypeCode.Float)
            .withOptionalProperty('speed', pip_services3_commons_node_7.TypeCode.Float)
            .withOptionalProperty('angle', pip_services3_commons_node_7.TypeCode.Float), (correlationId, args, callback) => {
            let orgId = args.getAsNullableString("org_id");
            let objectId = args.getAsNullableString("object_id");
            let time = args.getAsNullableDateTime("time");
            let lat = args.getAsFloat("lat");
            let lng = args.getAsFloat("lng");
            let alt = args.getAsNullableFloat("alt");
            let speed = args.getAsNullableFloat("speed");
            let angle = args.getAsNullableFloat("angle");
            this._logic.addPosition(correlationId, orgId, objectId, time, lat, lng, alt, speed, angle, (err) => {
                if (callback)
                    callback(err, null);
            });
        });
    }
    makeAddPositionsCommand() {
        return new pip_services3_commons_node_2.Command("add_positions", new pip_services3_commons_node_5.ObjectSchema(true)
            .withRequiredProperty('positions', new pip_services3_commons_node_6.ArraySchema(new ObjectPositionV1Schema_1.ObjectPositionV1Schema())), (correlationId, args, callback) => {
            let positions = args.get("positions");
            this._logic.addPositions(correlationId, positions, (err) => {
                if (callback)
                    callback(err, null);
            });
        });
    }
    makeDeletePositionsCommand() {
        return new pip_services3_commons_node_2.Command("delete_positions", new pip_services3_commons_node_5.ObjectSchema(true)
            .withOptionalProperty('filter', new pip_services3_commons_node_8.FilterParamsSchema()), (correlationId, args, callback) => {
            let filter = pip_services3_commons_node_3.FilterParams.fromValue(args.get("filter"));
            this._logic.deletePositions(correlationId, filter, (err) => {
                if (callback)
                    callback(err, null);
            });
        });
    }
}
exports.PositionsCommandSet = PositionsCommandSet;
//# sourceMappingURL=PositionsCommandSet.js.map