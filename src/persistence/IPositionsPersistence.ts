import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IGetter } from 'pip-services3-data-node';
import { IWriter } from 'pip-services3-data-node';

import { ObjectPositionV1 } from '../data/version1/ObjectPositionV1';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';

export interface IPositionsPersistence extends IGetter<ObjectPositionsV1, string>, IWriter<ObjectPositionsV1, string> {
    getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<ObjectPositionsV1>) => void): void;

    getCount(correlationId: string, filter: FilterParams, 
        callback: (err: any, count: number) => void): void;

    addOne(correlationId: string, orgId: string, objectId: string, 
        startTime: Date, endTime: Date, time: Date,
        lat: number, lng: number, alt: number, speed: number, angle: number,
        callback: (err: any) => void): void;

    addBatch(correlationId: string, positions: ObjectPositionV1[],
        callback: (err: any) => void): void;
            
    deleteByFilter(correlationId: string, filter: FilterParams,
        callback: (err: any) => void): void;
}
