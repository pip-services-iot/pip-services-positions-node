import { CommandSet } from 'pip-services3-commons-node';
import { ICommand } from 'pip-services3-commons-node';
import { Command } from 'pip-services3-commons-node';
import { Schema } from 'pip-services3-commons-node';
import { Parameters } from 'pip-services3-commons-node';
import { FilterParams } from 'pip-services3-commons-node';
import { PagingParams } from 'pip-services3-commons-node';
import { ObjectSchema } from 'pip-services3-commons-node';
import { ArraySchema } from 'pip-services3-commons-node';
import { TypeCode } from 'pip-services3-commons-node';
import { FilterParamsSchema } from 'pip-services3-commons-node';
import { PagingParamsSchema } from 'pip-services3-commons-node';
import { DateTimeConverter } from 'pip-services3-commons-node';

import { ObjectPositionV1 } from '../data/version1/ObjectPositionV1';
import { ObjectPositionV1Schema } from '../data/version1/ObjectPositionV1Schema';
import { ObjectPositionsV1 } from '../data/version1/ObjectPositionsV1';
import { ObjectPositionsV1Schema } from '../data/version1/ObjectPositionsV1Schema';
import { IPositionsController } from './IPositionsController';

export class PositionsCommandSet extends CommandSet {
    private _logic: IPositionsController;

    constructor(logic: IPositionsController) {
        super();

        this._logic = logic;

        // Register commands to the database
		this.addCommand(this.makeGetPositionsCommand());
		this.addCommand(this.makeGetTimelinePositionsCommand());
		this.addCommand(this.makeGetPositionsCountCommand());
		this.addCommand(this.makeAddPositionCommand());
		this.addCommand(this.makeAddPositionsCommand());
		this.addCommand(this.makeDeletePositionsCommand());
    }

	private makeGetPositionsCommand(): ICommand {
		return new Command(
			"get_positions",
			new ObjectSchema(true)
				.withOptionalProperty('filter', new FilterParamsSchema())
				.withOptionalProperty('paging', new PagingParamsSchema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let filter = FilterParams.fromValue(args.get("filter"));
                let paging = PagingParams.fromValue(args.get("paging"));
                this._logic.getPositions(correlationId, filter, paging, callback);
            }
		);
	}

	private makeGetTimelinePositionsCommand(): ICommand {
		return new Command(
			"get_timeline_positions",
			new ObjectSchema(true)
				.withRequiredProperty('time', null) // TypeCode.Date)
				.withOptionalProperty('filter', new FilterParamsSchema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let time = DateTimeConverter.toDateTime(args.get("time"));
                let filter = FilterParams.fromValue(args.get("filter"));
                this._logic.getTimelinePositions(correlationId, time, filter, callback);
            }
		);
	}
	
	private makeGetPositionsCountCommand(): ICommand {
		return new Command(
			"get_positions_count",
			new ObjectSchema(true)
				.withOptionalProperty('filter', new FilterParamsSchema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let filter = FilterParams.fromValue(args.get("filter"));
                this._logic.getPositionsCount(correlationId, filter, (err, count) => {
					let result = err == null && count != null ? { count: count } : null;
					callback(err, result);
				});
            }
		);
	}
	
	private makeAddPositionCommand(): ICommand {
		return new Command(
			"add_position",
			new ObjectSchema(true)
				.withRequiredProperty('org_id', TypeCode.String)
				.withRequiredProperty('object_id', TypeCode.String)
				.withRequiredProperty('time', null) //TypeCode.Date)
				.withRequiredProperty('lat', TypeCode.Float)
				.withRequiredProperty('lng', TypeCode.Float)
				.withOptionalProperty('alt', TypeCode.Float)
				.withOptionalProperty('speed', TypeCode.Float)
				.withOptionalProperty('angle', TypeCode.Float),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let orgId = args.getAsNullableString("org_id");
                let objectId = args.getAsNullableString("object_id");
                let time = args.getAsNullableDateTime("time");
                let lat = args.getAsFloat("lat");
                let lng = args.getAsFloat("lng");
                let alt = args.getAsNullableFloat("alt");
                let speed = args.getAsNullableFloat("speed");
                let angle = args.getAsNullableFloat("angle");
			    this._logic.addPosition(correlationId, orgId, objectId, time,
					lat, lng, alt, speed, angle, (err) => {
				   	if (callback) callback(err, null);
			   });
            }
		);
	}

	private makeAddPositionsCommand(): ICommand {
		return new Command(
			"add_positions",
			new ObjectSchema(true)
				.withRequiredProperty('positions', new ArraySchema(new ObjectPositionV1Schema())),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let positions = args.get("positions");
			    this._logic.addPositions(correlationId, positions, (err) => {
				   	if (callback) callback(err, null);
			   });
            }
		);
	}
	
	private makeDeletePositionsCommand(): ICommand {
		return new Command(
			"delete_positions",
			new ObjectSchema(true)
				.withOptionalProperty('filter', new FilterParamsSchema()),
            (correlationId: string, args: Parameters, callback: (err: any, result: any) => void) => {
                let filter = FilterParams.fromValue(args.get("filter"));
                this._logic.deletePositions(correlationId, filter, (err) => {
				   if (callback) callback(err, null);
			   });
			}
		);
	}

}