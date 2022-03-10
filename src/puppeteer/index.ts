import puppeteer, { Browser, ConnectOptions, Page } from 'puppeteer-core';
import { getBrowser, getEndpoint } from './global-browser';
import { getMockBrowser } from './mock-browser';

async function connect(
  options?: ConnectOptions,
  afterPageCreate = (page: Page): any => {
    return page;
  },
): Promise<Browser> {
  let browserWSEndpoint;

  if (!options || !options.browserWSEndpoint) {
    browserWSEndpoint = await getEndpoint();
  } else {
    browserWSEndpoint = options.browserWSEndpoint;
  }

  const originBrowser = await puppeteer.connect({
    ...options,
    browserWSEndpoint,
  });

  return getMockBrowser(originBrowser, afterPageCreate);
}

export { connect, getBrowser as launch, getBrowser };
