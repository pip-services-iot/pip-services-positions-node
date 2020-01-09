import { CommandSet } from 'pip-services3-commons-node';
import { IPositionsController } from './IPositionsController';
export declare class PositionsCommandSet extends CommandSet {
    private _logic;
    constructor(logic: IPositionsController);
    private makeGetPositionsCommand;
    private makeGetTimelinePositionsCommand;
    private makeGetPositionsCountCommand;
    private makeAddPositionCommand;
    private makeAddPositionsCommand;
    private makeDeletePositionsCommand;
}
