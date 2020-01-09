import { ConfigParams } from 'pip-services3-commons-node';
import { IConfigurable } from 'pip-services3-commons-node';
import { IReferences } from 'pip-services3-commons-node';
import { IReferenceable } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { DataPage } from 'pip-services3-commons-node';
import { ICommandable } from 'pip-services3-commons-node';
import { CommandSet } from 'pip-services3-commons-node';
import { ObjectPositionV1 } from '../data/version1/ObjectPositionV1';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';
import { IPositionsController } from './IPositionsController';
export declare class PositionsController implements IConfigurable, IReferenceable, ICommandable, IPositionsController {
    private static _defaultConfig;
    private _dependencyResolver;
    private _persistence;
    private _commandSet;
    private _intervalMin;
    private _interval;
    configure(config: ConfigParams): void;
    setReferences(references: IReferences): void;
    getCommandSet(): CommandSet;
    getPositions(correlationId: string, filter: FilterParams, paging: PagingParams, callback: (err: any, page: DataPage<ObjectPositionsV1>) => void): void;
    getTimelinePositions(correlationId: string, time: Date, filter: FilterParams, callback: (err: any, states: ObjectPositionV1[]) => void): void;
    getPositionsCount(correlationId: string, filter: FilterParams, callback: (err: any, count: number) => void): void;
    private calculateStartTime;
    addPosition(correlationId: string, orgId: string, objectId: string, time: Date, lat: number, lng: number, alt: number, speed: number, angle: number, callback?: (err: any) => void): void;
    addPositions(correlationId: string, positions: ObjectPositionV1[], callback?: (err: any) => void): void;
    deletePositions(correlationId: string, filter: FilterParams, callback?: (err: any) => void): void;
}
