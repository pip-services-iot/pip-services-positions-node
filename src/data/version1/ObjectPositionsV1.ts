import { IStringIdentifiable } from 'pip-services3-commons-node';
import { PositionV1 } from './PositionV1';

export class ObjectPositionsV1 implements IStringIdentifiable {
    public id: string;
    public org_id: string;
    public object_id: string;
    public start_time: Date;
    public end_time: Date;
    public last_time: Date;
    public count: number;
    public positions: PositionV1[];
}
