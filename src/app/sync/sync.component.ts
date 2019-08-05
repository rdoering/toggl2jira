import {Component, OnInit} from '@angular/core';
import {MessageService} from '../message.service';
import {SettingsService} from '../settings.service';
import {TogglService} from '../toggl.service';
import {TimeEntry, TimeEntrySyncState} from '../toggl/time.entry';
import {map} from 'rxjs/operators';
import {JiraService} from '../jira.service';
import {WorklogEntry} from '../jira/worklog.entry';
import {Project} from '../toggl/Project';
import {ToggleJiraKeyStorage} from '../settings/toggleJiraKeyStorage';

@Component({
    selector: 'app-sync',
    templateUrl: './sync.component.html',
    styleUrls: ['./sync.component.sass']
})
export class SyncComponent implements OnInit {

    public timeEntries: TimeEntry[];

    constructor(
        private messageService: MessageService,
        private settingsService: SettingsService,
        private togglService: TogglService,
        private jiraService: JiraService) {
    }

    ngOnInit() {
        this.getTimeEntriesWithProjects();
    }

    sync() {
        this.log('start syncing');
        this.timeEntries.forEach(timeEntry => {
            this.log(`entry ${timeEntry.id}`);
            if (!timeEntry.matchingWorklogEntry) {
                if (timeEntry.jiraKey.length > 0) {
                    this.log('create');
                  timeEntry.syncState = TimeEntrySyncState.Syncing;
                    this.jiraService.createWorklog(timeEntry.jiraKey, timeEntry.start, timeEntry.duration, timeEntry.description)
                        .subscribe(worklogEntry => {
                                timeEntry.worklog.worklogs.push(worklogEntry);
                                timeEntry.matchingWorklogEntry = worklogEntry;
                                timeEntry.syncState = TimeEntrySyncState.Synced;
                            },

                            err => {
                                timeEntry.syncState = TimeEntrySyncState.SyncFailed;
                                this.log(`Failed to create worklog entry ${timeEntry.jiraKey}: ${err.error.errorMessages}`);
                            }
                        );
                }
            }
        });
        this.log('finished syncing');
    }

    getMatchingWorklogEntry(timeEntry: TimeEntry): WorklogEntry {
        let matchingWorklogEntry = null;

        if (!timeEntry.worklog) {
            return matchingWorklogEntry;
        }
        if (timeEntry.duration < 60) {
            this.log(`Skipped Entry ${timeEntry.id} on ${timeEntry.start}, too short`);
            return matchingWorklogEntry;

        }
        const startToFind = new Date(timeEntry.start).toISOString();
        for (const worklogEntry of timeEntry.worklog.worklogs) {
            const start = new Date(worklogEntry.started).toISOString();
            if (start === startToFind) {
                matchingWorklogEntry = worklogEntry;
                break;
            }
        }

        return matchingWorklogEntry;
    }

    createWorklog(timeEntry: TimeEntry) {
        this.jiraService.createWorklog(timeEntry.project.name, timeEntry.start, timeEntry.duration, timeEntry.description)
            .subscribe(worklog => timeEntry.worklog.worklogs.push(worklog));
    }

    getCreateWorklogCurlCommand(timeEntry: TimeEntry): string {
        return this.jiraService.getCreateWorklogCurlCommand(
            timeEntry.project.name,
            timeEntry.start,
            timeEntry.duration,
            timeEntry.description);
    }

    removeEntry(timeEntry: TimeEntry) {
        const index = this.timeEntries.indexOf(timeEntry);
        if (index > -1) {
            this.timeEntries.splice(index, 1);
        }
    }

    isEachElementFetched() {
      if (this.timeEntries == null) {
        return false;
      }

      let result = true;
      for (const timeEntry of this.timeEntries) {
        switch (timeEntry.syncState) {
          case TimeEntrySyncState.FetchingJira:
          case TimeEntrySyncState.Unknown:
            result = false;
        }
      }
      return result;
    }

    getGermanDate(isoDateTime: string) {
        return new Date(isoDateTime).toLocaleString();
    }

    private getTimeEntriesWithProjects() {
        this.togglService.getAllProjects().subscribe(projects => {
                const projectIdToProject = new Map<number, Project>();
                for (const project of projects) {
                    if (project) {
                        projectIdToProject.set(project.id, project);
                    }
                }

                this.togglService.getTimeEntries().pipe(map(timeEntries => {
                    timeEntries.forEach(timeEntry => {
                      timeEntry.syncState = TimeEntrySyncState.Unknown;
                      timeEntry.project = this.getProject(timeEntry, projectIdToProject);
                      timeEntry.jiraKey = this.getJiraKey(timeEntry, projectIdToProject);

                      if (timeEntry.jiraKey.length > 0) {
                        if (timeEntry.duration < 60) {
                          timeEntry.syncState = TimeEntrySyncState.SyncNotNeeded;
                        } else {
                          timeEntry.syncState = TimeEntrySyncState.FetchingJira;
                          this.jiraService.getWorklogByKey(timeEntry.jiraKey)
                            .subscribe(worklog => {
                                timeEntry.worklog = worklog;
                                timeEntry.matchingWorklogEntry = this.getMatchingWorklogEntry(timeEntry);

                                const syncNeeded = TimeEntrySyncState.SyncNeeded;
                                const synced = TimeEntrySyncState.Synced;
                                timeEntry.syncState = timeEntry.matchingWorklogEntry == null ? syncNeeded : synced;
                              },
                              err => this.log(`Failed to get jira-worklogs for entry`));
                        }
                        }

                    });

                    return timeEntries;
                })).subscribe(
                    timeEntries => this.timeEntries = timeEntries
                );
            },
            () => this.log('Failed to get Projects'));
    }

    private getProject(timeEntry, projectIdToProject): Project {
        let project: Project;
        if (timeEntry.pid) {
            project = projectIdToProject.get(timeEntry.pid);
            if (!project) {
                this.log(`Failed to get toggl-project with id ${timeEntry.pid}`);
            }
        }
        return project;
    }

    private  getJiraKey(timeEntry, projectIdToProject): string {
        let jiraKey = '';
        switch (this.settingsService.getToggleJiraKeyStorage()) {
            case ToggleJiraKeyStorage.ProjectName:
                if (timeEntry.project) {
                    jiraKey = timeEntry.project.name;
                }
                break;

            case ToggleJiraKeyStorage.Description:

                const firstWord = timeEntry.description == null ? '' : timeEntry.description.match('^\\S*');
                jiraKey = firstWord.length > 0 ? firstWord[0] : '';
                break;
        }
        return jiraKey;
    }

    private startNotMatchingWorklog(timeEntry: TimeEntry): boolean {
        const start = new Date(timeEntry.start).toISOString();
        const worklogStarts = timeEntry.worklog.worklogs.map(worklogEntry => new Date(worklogEntry.started).toISOString());
        return !(worklogStarts.includes(start));
    }

    private log(message: string) {
        this.messageService.add(`SyncComponent: ${message}`);
    }

    getDuration(secs: number) {
        const hours = Math.floor(secs / 3600);
        const minutes = Math.floor((secs % 3600) / 60);
        const seconds = Math.floor(secs % 60);

        let result: string;
        if (hours > 0) {
            result = '<strong>' + hours + '</strong>:' + minutes + ':' + seconds;
        } else if (minutes > 0) {
            result = hours + ':<strong>' + minutes + '</strong>:' + seconds;
        } else {
            result = hours + ':' + minutes + ':' + seconds;
        }
        return result;

    }
}
