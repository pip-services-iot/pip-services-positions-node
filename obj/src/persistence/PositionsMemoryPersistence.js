"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_data_node_1 = require("pip-services3-data-node");
class PositionsMemoryPersistence extends pip_services3_data_node_1.IdentifiableMemoryPersistence {
    constructor() {
        super();
    }
    contains(array1, array2) {
        if (array1 == null || array2 == null)
            return false;
        for (let i1 = 0; i1 < array1.length; i1++) {
            for (let i2 = 0; i2 < array2.length; i2++)
                if (array1[i1] == array2[i1])
                    return true;
        }
        return false;
    }
    composeFilter(filter) {
        filter = filter || new pip_services3_commons_node_1.FilterParams();
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
        super.getPageByFilter(correlationId, this.composeFilter(filter), paging, null, null, this.filterResults(filter, callback));
    }
    getCount(correlationId, filter, callback) {
        let count = 0;
        let filterFunc = this.composeFilter(filter);
        for (let index = this._items.length - 1; index >= 0; index--) {
            let item = this._items[index];
            if (filterFunc(item)) {
                count += item.count || 0;
            }
        }
        this._logger.trace(correlationId, "Calculated count of %d", count);
        callback(null, count);
    }
    addOne(correlationId, orgId, objectId, startTime, endTime, time, lat, lng, alt, speed, angle, callback) {
        let item = this._items.find((x) => {
            return x.org_id == orgId
                && x.object_id == objectId
                && x.start_time <= time
                && x.end_time > time;
        });
        if (item == null) {
            item = {
                id: pip_services3_commons_node_2.IdGenerator.nextLong(),
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
        let pos = { time: time, lat: lat, lng: lng };
        if (alt)
            pos.alt = alt;
        if (speed)
            pos.spd = speed;
        if (angle)
            pos.agl = angle;
        item.positions.push(pos);
        item.last_time = time;
        item.count += 1;
        this._logger.trace(correlationId, "Added position for " + objectId + " at " + time);
        this.save(correlationId, (err) => {
            if (callback)
                callback(err);
        });
    }
    addBatch(correlationId, positions, callback) {
        async.each(positions, (p, callback) => {
            this.addOne(correlationId, p.org_id, p.object_id, p.start_time, p.end_time, p.time, p.lat, p.lng, p.alt, p.speed, p.angle, callback);
        }, callback);
    }
    deleteByFilter(correlationId, filter, callback) {
        super.deleteByFilter(correlationId, this.composeFilter(filter), callback);
    }
}
exports.PositionsMemoryPersistence = PositionsMemoryPersistence;
//# sourceMappingURL=PositionsMemoryPersistence.js.map