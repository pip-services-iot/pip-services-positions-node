let _ = require('lodash');

import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { IdGenerator } from 'pip-services3-commons-node';
import { IdentifiableMongoDbPersistence } from 'pip-services3-mongodb-node';

import { PositionV1 } from '../data/version1/PositionV1';
import { ObjectPositionV1 } from '../data/version1/ObjectPositionV1';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';
import { IPositionsPersistence } from './IPositionsPersistence';

export class PositionsMongoDbPersistence 
    extends IdentifiableMongoDbPersistence<ObjectPositionsV1, string> 
    implements IPositionsPersistence {

    constructor() {
        super('positions');
        super.ensureIndex({ org_id: 1, object_id: 1, start_time: -1, end_time: -1 });
        super.ensureIndex({ object_id: 1 });
        super.ensureIndex({ start_time: -1 });
        super.ensureIndex({ end_time: -1 });
    }
    
    private composeFilter(filter: any) {
        filter = filter || new FilterParams();

        let criteria = [];

        let orgId = filter.getAsNullableString('org_id');
        if (orgId != null)
            criteria.push({ org_id: orgId });

        let objectId = filter.getAsNullableString('object_id');
        if (objectId != null)
            criteria.push({ object_id: objectId });

        // Filter ids
        let objectIds = filter.getAsObject('object_ids');
        if (_.isString(objectIds))
            objectIds = objectIds.split(',');
        if (_.isArray(objectIds))
            criteria.push({ object_id: { $in: objectIds } });

        let fromTime = filter.getAsNullableDateTime('from_time');
        if (fromTime != null)
            criteria.push({ end_time: { $gte: fromTime } });

        let toTime = filter.getAsNullableDateTime('to_time');
        if (toTime != null)
            criteria.push({ start_time: { $lt: toTime } });

        return criteria.length > 0 ? { $and: criteria } : null;
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
            paging, null, "-start_time", this.filterResults(filter, callback));
    }

    public getCount(correlationId: string, filter: FilterParams, 
        callback: (err: any, count: number) => void): void {

        let criteria = this.composeFilter(filter);
        let options = { count: 1 };

        this._collection.find(criteria, options).toArray((err, items) => {
            if (err == null && items != null) {
                let count = 0;

                for (let item of items) {
                    count += item.count || 0;
                }

                this._logger.trace(correlationId, "Calculated count of %d", count);

                callback(null, count);
            } else {
                callback(err, null);
            }
        });
    }

    public addOne(correlationId: string, orgId: string, objectId: string, 
        startTime: Date, endTime: Date, time: Date,
        lat: number, lng: number, alt: number, speed: number, angle: number,
        callback: (err: any) => void): void {

        let filter = {
            org_id: orgId,
            object_id: objectId,
            start_time: { $lte: time },
            end_time: { $gt: time }
        };

        let pos = <PositionV1>{ time: time, lat: lat, lng: lng };
        if (alt) pos.alt = alt;
        if (speed) pos.spd = speed;
        if (angle) pos.agl = angle;

        let newItem = {
            $push: { positions: pos },
            $inc: { count: 1 },
            $setOnInsert: {
                _id: IdGenerator.nextLong(),
                org_id: orgId,
                object_id: objectId,
                start_time: startTime,
                end_time: endTime,
                last_time: time
            }
        };

        let options = {
            upsert: true
        };
        
        this._collection.findOneAndUpdate(filter, newItem, options, (err) => {
            if (!err)
                this._logger.trace(correlationId, "Added position for " +  objectId + " at " + time);
           
            if (callback) callback(err);
        });
    }

    public addBatch(correlationId: string, positions: ObjectPositionV1[],
        callback: (err: any) => void): void {

        if (positions == null || positions.length == 0) {
            if (callback) callback(null);
            return;
        }

        let options = {
            upsert: true
        };

        let batch = this._collection.initializeUnorderedBulkOp();

        let operations: any[] = [];

        for (let position of positions) {
            let pos = <PositionV1>{ 
                time: position.time,
                lat: position.lat,
                lng: position.lng
            };
            if (position.speed) pos.spd = position.speed;
            if (position.angle) pos.agl = position.angle;
    
            batch
                .find({
                    org_id: position.org_id,
                    object_id: position.object_id,
                    start_time: { $lte: position.time },
                    end_time: { $gt: position.time }
                })
                .upsert()
                .updateOne({
                    $push: { positions: pos },
                    $inc: { count: 1 },
                    $setOnInsert: {
                        _id: IdGenerator.nextLong(),
                        org_id: position.org_id,
                        object_id: position.object_id,
                        start_time: position.start_time,
                        end_time: position.end_time,
                        last_time: position.time
                    }
                });
        }

        batch.execute((err) => {
            if (!err)
                this._logger.trace(correlationId, "Added " + positions.length + " positions");
            
            if (callback) callback(null);
        });
    }
    
    public deleteByFilter(correlationId: string, filter: FilterParams,
        callback: (err: any) => void): void {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }

}
