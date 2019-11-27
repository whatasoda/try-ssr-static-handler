import { createStaticHandler } from './useStaticHandler';

interface Hoge {
  some: string;
}
// eslint-disable-next-line no-empty-pattern
export const hoge = createStaticHandler('hoge', ({}: Hoge) => ({
  // eslint-disable-next-line no-console
  onClick: (e) => console.log({ ...e }),
}));
