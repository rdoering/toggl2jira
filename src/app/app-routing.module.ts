import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SettingsComponent} from './settings/settings.component';
import {SyncComponent} from './sync/sync.component';
import {LogComponent} from './log/log.component';
import {WorkspacesComponent} from './workspaces/workspaces.component';

const routes: Routes = [
  {path: 'sync', component: SyncComponent},
  {path: '', redirectTo: '/sync', pathMatch: 'full'},

  {path: 'settings', component: SettingsComponent},
  {path: 'log', component: LogComponent},
  {path: 'ws', component: WorkspacesComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
