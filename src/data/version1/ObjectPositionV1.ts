export class ObjectPositionV1 {
    public org_id: string;
    public object_id: string;
    public time: Date;
    public start_time?: Date;
    public end_time?: Date;
    public lat: number;
    public lng: number;
    public alt?: number;
    public speed?: number;
    public angle?: number;
}
