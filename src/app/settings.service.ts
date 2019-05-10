import {EventEmitter, Injectable} from '@angular/core';
import {MessageService} from './message.service';
import {Settings} from './settings/settings';
import {BehaviorSubject, Observable} from 'rxjs';
import * as CryptoJS from 'crypto-js';
import {ToggleJiraKeyStorage} from './settings/toggleJiraKeyStorage';


@Injectable({
    providedIn: 'root'
})
export class SettingsService {

    private _togglApiKey: BehaviorSubject<string> = new BehaviorSubject('7f978fc...');
    public togglApiKey: Observable<string> = this._togglApiKey.asObservable();

    private _jiraServerUrl: BehaviorSubject<string> = new BehaviorSubject('https://jira-server.net');
    public jiraServerUrl: Observable<string> = this._jiraServerUrl.asObservable();

    private _togglJiraKeyStorage: BehaviorSubject<ToggleJiraKeyStorage> = new BehaviorSubject(ToggleJiraKeyStorage.ProjectName);
    public togglJiraKeyStorage: Observable<ToggleJiraKeyStorage> = this._togglJiraKeyStorage.asObservable();

    private _numOfDaysToSync: BehaviorSubject<number> = new BehaviorSubject(7);
    public numOfDaysToSync: Observable<number> = this._numOfDaysToSync.asObservable();

    private _jiraPassword: BehaviorSubject<string> = new BehaviorSubject('');
    public jiraPassword: Observable<string> = this._jiraPassword.asObservable();

    private _jiraUserName: BehaviorSubject<string> = new BehaviorSubject('');
    public jiraUserName: Observable<string> = this._jiraUserName.asObservable();

    private _jiraUseCookieOnly: BehaviorSubject<boolean> = new BehaviorSubject(true);
    public jiraUseCookieOnly: Observable<boolean> = this._jiraUseCookieOnly.asObservable();

    public jiraSettingsChanged: EventEmitter<Object> = new EventEmitter<Object>();

    private cfgPassphrase = 'a18ed7a616e47efddbc4033d37c193';


    constructor(private messageService: MessageService) {
        this.load();
    }

    setTogglApiKey(togglApiKey: string) {
        this._togglApiKey.next(togglApiKey);
        this.save();
    }

    getTogglApiKey() {
        return this._togglApiKey.getValue();
    }

    setJiraUseCookieOnly(jiraUseCookieOnly: boolean) {
        this._jiraUseCookieOnly.next(jiraUseCookieOnly);
        this.jiraSettingsChanged.emit(this);
        this.save();
    }

    isJiraUseCookieOnly(): boolean {
        return this._jiraUseCookieOnly.getValue();
    }

    setJiraUserName(jiraUserName: string) {
        this._jiraUserName.next(jiraUserName);
        this.save();
    }

    getJiraUserName(): string {
        return this._jiraUserName.getValue();
    }

    setJiraPassword(jiraPassword: string) {
        this._jiraPassword.next(jiraPassword);
        this.jiraSettingsChanged.emit(this);
        this.save();
    }


    getJiraPassword(): string {
        return this._jiraPassword.getValue();
    }

    setJiraServerUrl(jiraServerUrl: string) {
        this._jiraServerUrl.next(jiraServerUrl);
        this.jiraSettingsChanged.emit(this);
        this.save();
    }

    getJiraServerUrl(): string {
        return this._jiraServerUrl.getValue();
    }

    setTogglJiraKeyStorage(togglJiraKeyStorageTxt: string) {
        let togglJiraKeyStorage: ToggleJiraKeyStorage;
        switch (togglJiraKeyStorageTxt) {
            case ToggleJiraKeyStorage.Description:
                togglJiraKeyStorage = ToggleJiraKeyStorage.Description;
                break;

            case ToggleJiraKeyStorage.ProjectName:
                togglJiraKeyStorage = ToggleJiraKeyStorage.ProjectName;
                break;
        }
        this._togglJiraKeyStorage.next(togglJiraKeyStorage);

        this.jiraSettingsChanged.emit(this);

        this.save();
    }

    getToggleJiraKeyStorage(): ToggleJiraKeyStorage {
        return this._togglJiraKeyStorage.getValue();
    }

    setNumOfDaysToSync(numOfDaysToSync: any) {
        this._numOfDaysToSync.next(numOfDaysToSync);
        this.save();
    }

    getNumOfDaysToSync(): number {
        return this._numOfDaysToSync.getValue();
    }

    save() {
        const setting: Settings = new Settings();
        setting.togglJiraKeyStorage = this._togglJiraKeyStorage.getValue();
        setting.numOfDaysToSync = this._numOfDaysToSync.getValue();
        setting.jiraPassword = this._jiraPassword.getValue();
        setting.jiraUserName = this._jiraUserName.getValue();
        setting.jiraServerUrl = this._jiraServerUrl.getValue();
        setting.togglApiKey = this._togglApiKey.getValue();
        setting.jiraUseCookieOnly = this._jiraUseCookieOnly.getValue();

        const jsonTxt = JSON.stringify(setting);
        const encTxt = this.encrypt(jsonTxt);
        if (encTxt) {
            localStorage.setItem('settings', encTxt);
            this.log('Saved settings');
        } else {
            this.log('Failed to encrypt settings');
        }
    }

    load() {
        const encTxt = localStorage.getItem('settings');
        if (encTxt) {
            this.log('found stored config');
            const jsonTxt = this.decrypt(encTxt);
            try {
                const settings: Settings = JSON.parse(jsonTxt);
                this._togglApiKey.next(settings.togglApiKey);
                this._togglJiraKeyStorage.next(settings.togglJiraKeyStorage);
                this._numOfDaysToSync.next(settings.numOfDaysToSync);
                this._jiraServerUrl.next(settings.jiraServerUrl);
                this._jiraUserName.next(settings.jiraUserName);
                this._jiraPassword.next(settings.jiraPassword);
                this._jiraUseCookieOnly.next(settings.jiraUseCookieOnly);

                this.jiraSettingsChanged.emit(this);
            } catch (e) {
                this.log('Failed to decrypt settings');
            }
        }
    }

    private log(message: string) {
        this.messageService.add(`SettingsService: ${message}`);
    }

    private encrypt(plainText: string): string {
        const b64 = CryptoJS.AES.encrypt(plainText, this.cfgPassphrase).toString();
        const e64 = CryptoJS.enc.Base64.parse(b64);
        return e64.toString(CryptoJS.enc.Hex);
    }

    private decrypt(cipherText: string): string {
        const reb64 = CryptoJS.enc.Hex.parse(cipherText);
        const bytes = reb64.toString(CryptoJS.enc.Base64);
        const decrypt = CryptoJS.AES.decrypt(bytes, this.cfgPassphrase);
        return decrypt.toString(CryptoJS.enc.Utf8);
    }
}
