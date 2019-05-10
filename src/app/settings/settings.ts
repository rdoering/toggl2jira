import {ToggleJiraKeyStorage} from './toggleJiraKeyStorage';

export class Settings {
    togglApiKey: string;
    togglJiraKeyStorage: ToggleJiraKeyStorage;
    numOfDaysToSync: number;
    jiraServerUrl: string;
    jiraUserName: string;
    jiraPassword: string;
    jiraUseCookieOnly: boolean;
}
