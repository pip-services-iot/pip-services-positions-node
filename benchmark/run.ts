let _ = require('lodash');
let process = require('process');
let async = require('async');

import { BenchmarkRunner } from 'pip-benchmark-node';
import { ConsoleEventPrinter } from 'pip-benchmark-node';
import { MeasurementType } from 'pip-benchmark-node';
import { ExecutionType } from 'pip-benchmark-node';
import { PositionsBenchmarkSuite } from './PositionsBenchmarkSuite';

let runner = new BenchmarkRunner();

ConsoleEventPrinter.attach(runner);

runner.benchmarks.addSuite(new PositionsBenchmarkSuite);

runner.parameters.set({
    'Positions.InitialRecordNumber': 0,
    'Positions.SiteNumber': 1,
    'Positions.ObjectNumber': 100,
    'Positions.MongoUri': process.env['MONGO_URI'],
    'Positions.MongoHost': process.env['MONGO_HOST'] || 'localhost',
    'Positions.MongoPort': process.env['MONGO_PORT'] || 27017,
    'Positions.MongoDb': process.env['MONGO_DB'] || 'benchmark'
});

runner.configuration.measurementType = MeasurementType.Peak;
runner.configuration.executionType = ExecutionType.Sequential;
runner.configuration.duration = 10 * 24 * 3600;

runner.benchmarks.selectByName(['Positions.AddMongoDbPositions']);

runner.run((err: any) => {
    if (err) console.error(err);
});

// Log uncaught exceptions
process.on('uncaughtException', (ex) => {
    console.error(ex);
    console.error("Process is terminated");
    process.exit(1);
});

// Gracefully shutdown
process.on('exit', function () {
    runner.stop();
    //console.log("Goodbye!");
});
