"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_mongodb_node_1 = require("pip-services3-mongodb-node");
class PositionsMongoDbPersistence extends pip_services3_mongodb_node_1.IdentifiableMongoDbPersistence {
    constructor() {
        super('positions');
        super.ensureIndex({ org_id: 1, object_id: 1, start_time: -1, end_time: -1 });
        super.ensureIndex({ object_id: 1 });
        super.ensureIndex({ start_time: -1 });
        super.ensureIndex({ end_time: -1 });
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
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
    filterResults(filter, callback) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
        let fromTime = filter.getAsNullableDateTime('from_time');
        let toTime = filter.getAsNullableDateTime('to_time');
        return (err, page) => {
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
    getPageByFilter(correlationId, filter, paging, callback) {
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, "-start_time", this.filterResults(filter, callback));
    }
    getCount(correlationId, filter, callback) {
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
            }
            else {
                callback(err, null);
            }
        });
    }
    addOne(correlationId, orgId, objectId, startTime, endTime, time, lat, lng, alt, speed, angle, callback) {
        let filter = {
            org_id: orgId,
            object_id: objectId,
            start_time: { $lte: time },
            end_time: { $gt: time }
        };
        let pos = { time: time, lat: lat, lng: lng };
        if (alt)
            pos.alt = alt;
        if (speed)
            pos.spd = speed;
        if (angle)
            pos.agl = angle;
        let newItem = {
            $push: { positions: pos },
            $inc: { count: 1 },
            $setOnInsert: {
                _id: pip_services3_commons_node_2.IdGenerator.nextLong(),
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
                this._logger.trace(correlationId, "Added position for " + objectId + " at " + time);
            if (callback)
                callback(err);
        });
    }
    addBatch(correlationId, positions, callback) {
        if (positions == null || positions.length == 0) {
            if (callback)
                callback(null);
            return;
        }
        let options = {
            upsert: true
        };
        let batch = this._collection.initializeUnorderedBulkOp();
        let operations = [];
        for (let position of positions) {
            let pos = {
                time: position.time,
                lat: position.lat,
                lng: position.lng
            };
            if (position.speed)
                pos.spd = position.speed;
            if (position.angle)
                pos.agl = position.angle;
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
                    _id: pip_services3_commons_node_2.IdGenerator.nextLong(),
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
            if (callback)
                callback(null);
        });
    }
    deleteByFilter(correlationId, filter, callback) {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }
}
exports.PositionsMongoDbPersistence = PositionsMongoDbPersistence;
//# sourceMappingURL=PositionsMongoDbPersistence.js.map