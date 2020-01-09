let _ = require('lodash');
let async = require('async');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IdGenerator } from 'pip-services3-commons-node';
import { IdentifiableMemoryPersistence } from 'pip-services3-data-node';

import { PositionV1 } from '../data/version1/PositionV1';
import { ObjectPositionV1 } from '../data/version1/ObjectPositionV1';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';
import { IPositionsPersistence } from './IPositionsPersistence';

export class PositionsMemoryPersistence 
    extends IdentifiableMemoryPersistence<ObjectPositionsV1, string> 
    implements IPositionsPersistence {

    constructor() {
        super();
    }

    private contains(array1, array2) {
        if (array1 == null || array2 == null) return false;
        
        for (let i1 = 0; i1 < array1.length; i1++) {
            for (let i2 = 0; i2 < array2.length; i2++)
                if (array1[i1] == array2[i1]) 
                    return true;
        }
        
        return false;
    }
    
    private composeFilter(filter: FilterParams): any {
        filter = filter || new FilterParams();
        
        let objectId = filter.getAsNullableString('object_id');
        let orgId = filter.getAsNullableString('org_id');
        let objectIds = filter.getAsObject('object_ids');
        let fromTime = filter.getAsNullableDateTime('from_time');
        let toTime = filter.getAsNullableDateTime('to_time');
        
        // Process ids filter
        if (_.isString(objectIds))
            objectIds = objectIds.split(',');
        if (!_.isArray(objectIds))
            objectIds = null;
        
        return (item) => {
            if (objectId && item.object_id != objectId) 
                return false;
            if (objectIds && _.indexOf(objectIds, item.object_id) < 0)
                return false;
            if (orgId && item.org_id != orgId) 
                return false;
            if (fromTime && item.end_time.getTime() < fromTime.getTime()) 
                return false;
            if (toTime && item.start_time.getTime() >= toTime.getTime()) 
                return false;
            return true;
        };
    }

    private filterResults(filter: FilterParams,
        callback: (err: any, page: DataPage<ObjectPositionsV1>) => void): any {

        filter = filter || new FilterParams();
        
        let fromTime = filter.getAsNullableDateTime('from_time');
        let toTime = filter.getAsNullableDateTime('to_time');
        
        return (err: any, page: DataPage<ObjectPositionsV1>) => {
            // Skip when error occured
            if (err != null || page == null) {
                callback(err, page);
                return;
            }

            // Filter out all elements without object id
            for (let item of page.data) {
                if (fromTime != null)
                    item.positions = _.filter(item.positions, s => s.time >= fromTime);
                if (toTime != null)
                    item.positions = _.filter(item.positions, s => s.time < toTime);
            }

            callback(err, page);
        };
    }
    
    public getPageByFilter(correlationId: string, filter: FilterParams, paging: PagingParams,
        callback: (err: any, page: DataPage<ObjectPositionsV1>) => void): void {
        super.getPageByFilter(correlationId, this.composeFilter(filter),
            paging, null, null, this.filterResults(filter, callback));
    }

    public getCount(correlationId: string, filter: FilterParams, 
        callback: (err: any, count: number) => void): void {
        let count = 0;
        let filterFunc = this.composeFilter(filter);

        for (let index = this._items.length - 1; index>= 0; index--) {
            let item = this._items[index];
            if (filterFunc(item)) {
                count += item.count || 0;
            }
        }

        this._logger.trace(correlationId, "Calculated count of %d", count);
        
        callback(null, count);
    }
    
    public addOne(correlationId: string, orgId: string, objectId: string, 
        startTime: Date, endTime: Date, time: Date,
        lat: number, lng: number, alt: number, speed: number, angle: number,
        callback: (err: any) => void): void {

        let item = this._items.find((x) => { 
            return x.org_id == orgId 
                && x.object_id == objectId 
                && x.start_time <= time
                && x.end_time > time; 
        });

        if (item == null) {
            item = <ObjectPositionsV1> {
                id: IdGenerator.nextLong(),
                org_id: orgId,
                object_id: objectId,
                start_time: startTime,
                end_time: endTime,
                positions: [],
                count: 0
            };
            this._items.push(item);
        }

        item.positions = item.positions || [];
        let pos = <PositionV1>{ time: time, lat: lat, lng: lng };
        if (alt) pos.alt = alt;
        if (speed) pos.spd = speed;
        if (angle) pos.agl = angle;
        item.positions.push(pos);
        item.last_time = time;
        item.count += 1;

        this._logger.trace(correlationId, "Added position for " +  objectId + " at " + time);

        this.save(correlationId, (err) => {
            if (callback) callback(err);
        });
    }

    public addBatch(correlationId: string, positions: ObjectPositionV1[],
        callback: (err: any) => void): void {

        async.each(positions, (p, callback) => {
            this.addOne(
                correlationId,
                p.org_id, p.object_id, p.start_time, p.end_time,
                p.time, p.lat, p.lng, p.alt, p.speed, p.angle, callback
            );
        }, callback);
    }
    
    public deleteByFilter(correlationId: string, filter: FilterParams,
        callback: (err: any) => void): void {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }

}
