"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const PositionV1Schema_1 = require("./PositionV1Schema");
class ObjectPositionsV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withOptionalProperty('id', pip_services3_commons_node_3.TypeCode.String);
        this.withRequiredProperty('org_id', pip_services3_commons_node_3.TypeCode.String);
        this.withRequiredProperty('object_id', pip_services3_commons_node_3.TypeCode.String);
        this.withRequiredProperty('start_time', pip_services3_commons_node_3.TypeCode.DateTime);
        this.withRequiredProperty('end_time', pip_services3_commons_node_3.TypeCode.DateTime);
        this.withRequiredProperty('last_time', pip_services3_commons_node_3.TypeCode.DateTime);
        this.withOptionalProperty('count', pip_services3_commons_node_3.TypeCode.Integer);
        this.withOptionalProperty('positions', new pip_services3_commons_node_2.ArraySchema(PositionV1Schema_1.PositionV1Schema));
    }
}
exports.ObjectPositionsV1Schema = ObjectPositionsV1Schema;
//# sourceMappingURL=ObjectPositionsV1Schema.js.map