import { IStringIdentifiable } from 'pip-services3-commons-node';
import { PositionV1 } from './PositionV1';
export declare class ObjectPositionsV1 implements IStringIdentifiable {
    id: string;
    org_id: string;
    object_id: string;
    start_time: Date;
    end_time: Date;
    last_time: Date;
    count: number;
    positions: PositionV1[];
}
