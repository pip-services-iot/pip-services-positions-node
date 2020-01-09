"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
class PositionV1Schema extends pip_services3_commons_node_1.ObjectSchema {
    constructor() {
        super();
        this.withRequiredProperty('time', pip_services3_commons_node_2.TypeCode.DateTime);
        this.withRequiredProperty('lat', pip_services3_commons_node_2.TypeCode.Float);
        this.withRequiredProperty('lng', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('alt', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('spd', pip_services3_commons_node_2.TypeCode.Float);
        this.withOptionalProperty('agl', pip_services3_commons_node_2.TypeCode.Float);
    }
}
exports.PositionV1Schema = PositionV1Schema;
//# sourceMappingURL=PositionV1Schema.js.map