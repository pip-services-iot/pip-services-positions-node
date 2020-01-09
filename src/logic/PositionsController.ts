let _ = require('lodash');
let async = require('async');
let moment = require('moment');

import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { Descriptor } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { DependencyResolver } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';

import { ObjectPositionV1 } from '../data/version1/ObjectPositionV1';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';
import { IPositionsPersistence } from '../persistence/IPositionsPersistence';
import { IPositionsController } from './IPositionsController';
import { PositionsCommandSet } from './PositionsCommandSet';

export class PositionsController implements  IConfigurable, IReferenceable, ICommandable, IPositionsController {
    private static _defaultConfig: ConfigParams = ConfigParams.fromTuples(
        'dependencies.persistence', 'pip-services-positions:persistence:*:*:1.0'
    );

    private _dependencyResolver: DependencyResolver = new DependencyResolver(PositionsController._defaultConfig);
    private _persistence: IPositionsPersistence;
    private _commandSet: PositionsCommandSet;
    private _intervalMin: number = 15; // in minutes
    private _interval: number = this._intervalMin * 60000; // in msecs

    public configure(config: ConfigParams): void {
        this._dependencyResolver.configure(config);

        this._intervalMin = config.getAsLongWithDefault('options.interval', this._intervalMin);
        this._interval = this._intervalMin * 60000;
    }

    public setReferences(references: IReferences): void {
        this._dependencyResolver.setReferences(references);
        this._persistence = this._dependencyResolver.getOneRequired<IPositionsPersistence>('persistence');
    }

    public getCommandSet(): CommandSet {
        if (this._commandSet == null)
            this._commandSet = new PositionsCommandSet(this);
        return this._commandSet;
    }
    
    public getPositions(correlationId: string, filter: FilterParams, paging: PagingParams, 
        callback: (err: any, page: DataPage<ObjectPositionsV1>) => void): void {
        this._persistence.getPageByFilter(correlationId, filter, paging, callback);
    }

    public getTimelinePositions(correlationId: string, time: Date, filter: FilterParams,
        callback: (err: any, states: ObjectPositionV1[]) => void): void {

        // By default take current time
        time = DateTimeConverter.toDateTimeWithDefault(time, new Date());
        let cutOffTime = time.getTime() + 1000;

        // Start from online timeout
        let fromTime = new Date(time.getTime() - this._interval);
        // End with 1 sec ahead of specified timeline
        let toTime = new Date(time.getTime() + 1000);

        // Update filter
        filter = FilterParams.fromValue(filter);
        filter.setAsObject('from_time', fromTime);
        filter.setAsObject('to_time', toTime);

        let pages = 0;
        let skip = 0;
        let take = 1000;
        let reading = true;

        let result: ObjectPositionV1[] = [];

        // Read several pages
        async.doWhilst(
            (callback) => {
                // Read a page
                this._persistence.getPageByFilter(
                    correlationId, filter, new PagingParams(skip, take, false),
                    (err, page) => {
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
                                    } else if (result[pos].time.getTime() < position.time.getTime()) {
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
                    }
                )
            }, 
            () => reading,
            (err) => {
                callback(err, err == null ? result : null);
            }
        );
    }
                    
    public getPositionsCount(correlationId: string, filter: FilterParams, 
        callback: (err: any, count: number) => void): void {
        this._persistence.getCount(correlationId, filter, callback);
    }
    
    private calculateStartTime(time: Date): Date {
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

    public addPosition(correlationId: string, orgId: string, objectId: string, 
        time: Date, lat: number, lng: number, alt: number, speed: number, angle: number,
        callback?: (err: any) => void): void {
        if (lat == null || lng == null || lat == NaN || lng == NaN) {
            return;
        }
        let startTime: Date = this.calculateStartTime(time);
        let endTime: Date = new Date(startTime.getTime() + this._interval);

        this._persistence.addOne(correlationId,
            orgId, objectId, startTime, endTime, time, lat, lng, alt, speed, angle,
            callback
        );
    }

    public addPositions(correlationId: string, positions: ObjectPositionV1[],
        callback?: (err: any) => void): void {
        
        if (positions == null || positions.length == 0) {
            if (callback) callback(null);
            return;
        }

        for (let position of positions) {
            position.time = DateTimeConverter.toDateTime(position.time);
            position.start_time = this.calculateStartTime(position.time);
            position.end_time = new Date(position.start_time.getTime() + this._interval);
        }

        this._persistence.addBatch(correlationId, positions, callback);
    }
    
    public deletePositions(correlationId: string, filter: FilterParams,
        callback?: (err: any) => void): void {  
        this._persistence.deleteByFilter(correlationId, filter, callback);
    }

}
