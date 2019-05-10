import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {SettingsComponent} from './settings/settings.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {
    MatButtonModule, MatButtonToggleModule,
    MatCardModule, MatCheckboxModule,
    MatExpansionModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatToolbarModule
} from '@angular/material';
import {HttpClientModule} from '@angular/common/http';
import {SyncComponent} from './sync/sync.component';
import {JiraComponent} from './jira/jira.component';
import {LogComponent} from './log/log.component';
import {WorkspacesComponent } from './workspaces/workspaces.component';
import {ReversePipe} from './pipes/reverse.pipe';

@NgModule({
    declarations: [
        AppComponent,
        SettingsComponent,
        SyncComponent,
        JiraComponent,
        LogComponent,
        WorkspacesComponent,
        ReversePipe
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FormsModule,
        HttpClientModule,
        MatInputModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatToolbarModule,
        MatListModule,
        MatExpansionModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatSelectModule,
        MatButtonToggleModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})

export class AppModule {
}
