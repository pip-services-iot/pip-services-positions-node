import { DataPage } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';

import { ObjectPositionV1 } from '../data/version1/ObjectPositionV1';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';

export interface IPositionsController {
    getPositions(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<ObjectPositionsV1>) => void): void;

    getTimelinePositions(correlationId: string, time: Date, filter: FilterParams,
        callback: (err: any, states: ObjectPositionV1[]) => void): void;

    getPositionsCount(correlationId: string, filter: FilterParams, 
        callback: (err: any, count: number) => void): void;
        
    addPosition(correlationId: string, orgId: string, objectId: string, time: Date,
        lat: number, lng: number, alt: number, speed: number, angle: number,
        callback?: (err: any) => void): void;

    addPositions(correlationId: string, positions: ObjectPositionV1[],
        callback?: (err: any) => void): void;
            
    deletePositions(correlationId: string, filter: FilterParams,
        callback?: (err: any) => void): void;
}
