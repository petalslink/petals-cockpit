// base selector
const bs = `simple-notification`;

export const NOTIFICATION_DOM = type => ({
  baseSelector: bs,
  texts: {
    title: `${bs} .${type} .sn-title`,
    content: `${bs} .${type} .sn-content`,
  },
});
