// base selector
const bs = `simple-notification`;

export const NOTIFICATION_DOM = type => ({
  baseSelector: bs,
  buttons: {
    goToAdminPage: `${bs} .${type} .btn-usr-admin`,
    userAvatar: `${bs} .${type} .btn-avatar-user`,
    logout: `${bs} .${type} .btn-logout-user`,
    logo: `${bs} .${type} .toolbar-logo`,
    toggleSidenavButton: `${bs} .${type} .sidenav-toggle`,
  },
  text: {
    title: `${bs} .${type} .sn-title`,
    content: `${bs} .${type} .sn-content`,
  },
});
