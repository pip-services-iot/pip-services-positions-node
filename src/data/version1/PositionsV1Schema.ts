import { ObjectSchema } from 'pip-services3-commons-node';
import { ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';

import { PositionV1Schema } from './PositionV1Schema';

export class ObjectPositionsV1Schema extends ObjectSchema {
    public constructor() {
        super();
        this.withOptionalProperty('id', TypeCode.String);
        this.withRequiredProperty('org_id', TypeCode.String);
        this.withRequiredProperty('object_id', TypeCode.String);
        this.withRequiredProperty('start_time', TypeCode.DateTime);
        this.withRequiredProperty('end_time', TypeCode.DateTime);
        this.withRequiredProperty('last_time', TypeCode.DateTime);
        this.withOptionalProperty('count', TypeCode.Integer);
        this.withOptionalProperty('positions', new ArraySchema(PositionV1Schema));
    }
}
