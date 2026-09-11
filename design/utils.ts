import { createCn } from 'cn/config';

export const cn = createCn({
  extend: {
    theme: {
      text: [
        'body-small-default',
        'body-small-subtle',
        'body-small-strong',
        'body-medium-default',
        'body-medium-subtle',
        'body-medium-strong',
        'body-large-default',
        'body-large-subtle',
        'body-large-strong',
        'title-small-strong',
        'title-medium-strong',
        'title-large-subtle',
        'title-large-strong',
        'display-small-strong',
        'display-medium-strong',
        'display-large-strong',
      ],
    },
  },
});

export { cn as mergeTailwindClasses };
