import {Project} from './Project';
import {Worklog} from '../jira/worklog';
import {WorklogEntry} from '../jira/worklog.entry';

export enum TimeEntrySyncState {
  Unknown = 'Unknown',
  FetchingJira = 'FetchingJira',
  SyncNeeded = 'SyncNeeded',
  Syncing = 'Syncing',
  SyncNotNeeded = 'SyncNotNeeded',
  SyncFailed = 'SyncFailed',
  Synced = 'Synced',
}


export class TimeEntry {
    id: number;
    guid: string;
    wid: number;
    pid: number;
    billable: boolean;
    start: string;
    stop: string;
    duration: number;
    description: string;
    duronly: boolean;
    at: string;
    uid: number;
    project?: Project;
    worklog?: Worklog;
    matchingWorklogEntry: WorklogEntry;
    jiraKey: string;
    syncState: TimeEntrySyncState;
}
