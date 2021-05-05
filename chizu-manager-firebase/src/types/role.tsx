import { Colors } from "./bootstrap";

export enum PageRoles {
    Administrator = '管理者',
    Manager = 'ﾏﾈｰｼﾞｬ',
    Editor = '編集者',
    User = '利用者',
}

export const PageRoleBadgeColor = {
    [PageRoles.Administrator]: Colors.Danger,
    [PageRoles.Manager]: Colors.Warning,
    [PageRoles.Editor]: Colors.Primary,
    [PageRoles.User]: Colors.Success,
}