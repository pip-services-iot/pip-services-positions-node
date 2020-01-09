"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
let _ = require('lodash');
let async = require('async');
let moment = require('moment');
const pip_services3_commons_node_1 = require("pip-services3-commons-node");
const pip_services3_commons_node_2 = require("pip-services3-commons-node");
const pip_services3_commons_node_3 = require("pip-services3-commons-node");
const pip_services3_commons_node_4 = require("pip-services3-commons-node");
const pip_services3_commons_node_5 = require("pip-services3-commons-node");
const PositionsCommandSet_1 = require("./PositionsCommandSet");
class PositionsController {
    constructor() {
        this._dependencyResolver = new pip_services3_commons_node_2.DependencyResolver(PositionsController._defaultConfig);
        this._intervalMin = 15; // in minutes
        this._interval = this._intervalMin * 60000; // in msecs
    }
    configure(config) {
        this._dependencyResolver.configure(config);
        this._intervalMin = config.getAsLongWithDefault('options.interval', this._intervalMin);
        this._interval = this._intervalMin * 60000;
    }
    setReferences(references) {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired('persistence');
    }
    getCommandSet() {
        if (this._commandSet == null)
            this._commandSet = new PositionsCommandSet_1.PositionsCommandSet(this);
        return this._commandSet;
    }
    getPositions(correlationId, filter, paging, callback) {
        this._persistence.getPageByFilter(correlationId, filter, paging, callback);
    }
    getTimelinePositions(correlationId, time, filter, callback) {
        // By default take current time
        time = pip_services3_commons_node_5.DateTimeConverter.toDateTimeWithDefault(time, new Date());
        let cutOffTime = time.getTime() + 1000;
        // Start from online timeout
        let fromTime = new Date(time.getTime() - this._interval);
        // End with 1 sec ahead of specified timeline
        let toTime = new Date(time.getTime() + 1000);
        // Update filter
        filter = pip_services3_commons_node_3.FilterParams.fromValue(filter);
        filter.setAsObject('from_time', fromTime);
        filter.setAsObject('to_time', toTime);
        let pages = 0;
        let skip = 0;
        let take = 1000;
        let reading = true;
        let result = [];
        // Read several pages
        async.doWhilst((callback) => {
            // Read a page
            this._persistence.getPageByFilter(correlationId, filter, new pip_services3_commons_node_4.PagingParams(skip, take, false), (err, page) => {
                pages++;
                skip += take;
                // Give small slack for a page
                reading = pages < 10 && page != null && page.data.length > (take - 3);
                // Append states to the list. Take the latest for each object
                if (page != null) {
                    for (let positions of page.data) {
                        for (let position of positions.positions) {
                            if (position.time.getTime() > cutOffTime)
                                continue;
                            // Todo: Shall we consider assigned objects here?
                            let pos = _.findIndex(result, (s) => s.object_id == positions.object_id);
                            if (pos < 0) {
                                result.push({
                                    org_id: positions.org_id,
                                    object_id: positions.object_id,
                                    time: position.time,
                                    lat: position.lat,
                                    lng: position.lng,
                                    alt: position.alt,
                                    speed: position.spd,
                                    angle: position.agl
                                });
                            }
                            else if (result[pos].time.getTime() < position.time.getTime()) {
                                result[pos].time = position.time;
                                result[pos].lat = position.lat;
                                result[pos].lng = position.lng;
                                result[pos].alt = position.alt;
                                result[pos].speed = position.spd;
                                result[pos].angle = position.agl;
                            }
                        }
                    }
                }
                callback(err);
            });
        }, () => reading, (err) => {
            callback(err, err == null ? result : null);
        });
    }
    getPositionsCount(correlationId, filter, callback) {
        this._persistence.getCount(correlationId, filter, callback);
    }
    calculateStartTime(time) {
        let year = time.getUTCFullYear();
        let month = time.getUTCMonth();
        let day = time.getUTCDate();
        let hour = time.getUTCHours();
        let min = time.getUTCMinutes();
        let sec = time.getUTCSeconds();
        let msec = time.getUTCMilliseconds();
        let dayStartUtc = Date.UTC(year, month, day);
        let timeUtc = Date.UTC(year, month, day, hour, min, sec, msec);
        let offset = timeUtc - dayStartUtc;
        offset = offset - (offset % this._interval);
        return new Date(dayStartUtc + offset);
    }
    addPosition(correlationId, orgId, objectId, time, lat, lng, alt, speed, angle, callback) {
        if (lat == null || lng == null || lat == NaN || lng == NaN) {
            return;
        }
        let startTime = this.calculateStartTime(time);
        let endTime = new Date(startTime.getTime() + this._interval);
        this._persistence.addOne(correlationId, orgId, objectId, startTime, endTime, time, lat, lng, alt, speed, angle, callback);
    }
    addPositions(correlationId, positions, callback) {
        if (positions == null || positions.length == 0) {
            if (callback)
                callback(null);
            return;
        }
        for (let position of positions) {
            position.time = pip_services3_commons_node_5.DateTimeConverter.toDateTime(position.time);
            position.start_time = this.calculateStartTime(position.time);
            position.end_time = new Date(position.start_time.getTime() + this._interval);
        }
        this._persistence.addBatch(correlationId, positions, callback);
    }
    deletePositions(correlationId, filter, callback) {
        this._persistence.deleteByFilter(correlationId, filter, callback);
    }
}
exports.PositionsController = PositionsController;
PositionsController._defaultConfig = pip_services3_commons_node_1.ConfigParams.fromTuples('dependencies.persistence', 'pip-services-positions:persistence:*:*:1.0');
//# sourceMappingURL=PositionsController.js.map