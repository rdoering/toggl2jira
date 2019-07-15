import {Workspace} from './workspace';

export interface Me {
    since: number;
    data: Data;
}

interface Data {
    id: string;
    api_token: string;
    default_wid: string;
    email: string;
    fullname: string;
    jquery_timeofday_format: string;
    jquery_date_format: string;
    timeofday_format: string;
    date_format: string;
    store_start_and_stop_time: string;
    beginning_of_week: string;
    language: string;
    image_url: string;
    sidebar_piechart: string;
    at: string;
    created_at: string;
    retention: string;
    record_timeline: string;
    render_timeline: string;
    timeline_enabled: string;
    timeline_experiment: string;
    should_upgrade: string;
    achievements_enabled: string;
    timezone: string;
    openid_enabled: string;
    send_product_emails: string;
    send_weekly_report: string;
    send_timer_notifications: string;
    last_blog_entry: string;
    invitation: string;
    workspaces: Workspace[];
    duration_format: string;
}
