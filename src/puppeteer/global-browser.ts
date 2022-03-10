import { resolve } from 'path';
import puppeteer, { Browser, launch } from 'puppeteer-core';
import { Errors } from '../common/error';
import { findChrome } from './find-chrome';
import { getMockBrowser } from './mock-browser';

const USER_DATA_DIR = resolve(__dirname, '../../../.local-data/profile');

let globalBrowserPromise: Promise<Browser> | undefined;
async function getBrowser(
  options?: Parameter<typeof launch>,
): Promise<puppeteer.Browser> {
  if (!globalBrowserPromise) {
    const localChrome = findChrome();

    if (!localChrome) {
      throw new Errors.LocalChromeNotFound();
    }

    const args = [
      '--app=data:text/html,',
      '--window-size=1000,600',
      '--window-position=150,60',
    ];

    globalBrowserPromise = puppeteer
      .launch({
        args,
        executablePath: localChrome.executablePath,
        headless: false,
        defaultViewport: null,
        pipe: true,
        userDataDir: USER_DATA_DIR,
        ignoreDefaultArgs: [
          '--enable-automation',
          '--enable-blink-features=IdleDetection',
        ],

        ...options,
      })
      .then(async (browser) => {
        const [page] = await browser.pages();

        if (page) {
          await page.close();
        }

        return getMockBrowser(browser);
      });
  }

  return globalBrowserPromise;
}

async function getEndpoint(): Promise<string> {
  const browser = await getBrowser();
  return browser.wsEndpoint();
}

async function clean(): Promise<{
  len: number;
}> {
  if (!globalBrowserPromise) {
    return { len: 0 };
  }

  const browser = await globalBrowserPromise;
  globalBrowserPromise = undefined;

  const pages = await browser.pages();
  await browser.close();

  return {
    len: pages.length,
  };
}

export { getEndpoint, clean, getBrowser, USER_DATA_DIR };
