import { Browser, Page } from 'puppeteer-core';

async function hideHeadlessAttr(browser: Browser, page: Page) {
  const userAgent = await browser.userAgent();

  await page.setUserAgent(userAgent.replace(/(?<=\s)Headless(?=Chrome)/i, ''));

  await page.evaluateOnNewDocument(() => {
    /* eslint-disable no-undef, @typescript-eslint/ban-ts-comment */

    // overwrite the `languages` property to use a custom getter
    if (!navigator.languages || navigator.languages.length === 0) {
      Object.defineProperty(navigator, 'languages', {
        get() {
          return ['zh-CN', 'zh', 'zh-TW', 'en-US', 'en'];
        },
      });
    }

    // Overwrite the `plugins` property to use a custom getter.
    if (!navigator.plugins || navigator.plugins.length === 0) {
      Object.defineProperty(navigator, 'plugins', {
        get: () => {
          return [1, 2, 3, 4, 5];
        },
      });
    }

    // Pass the Webdriver test
    if (navigator.webdriver) {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => {
          return false;
        },
      });
    }

    const chrome = {
      app: {
        isInstalled: false,
        InstallState: {
          DISABLED: 'disabled',
          INSTALLED: 'installed',
          NOT_INSTALLED: 'not_installed',
        },
        RunningState: {
          CANNOT_RUN: 'cannot_run',
          READY_TO_RUN: 'ready_to_run',
          RUNNING: 'running',
        },
      },
      runtime: {
        OnInstalledReason: {
          CHROME_UPDATE: 'chrome_update',
          INSTALL: 'install',
          SHARED_MODULE_UPDATE: 'shared_module_update',
          UPDATE: 'update',
        },
        OnRestartRequiredReason: {
          APP_UPDATE: 'app_update',
          OS_UPDATE: 'os_update',
          PERIODIC: 'periodic',
        },
        PlatformArch: {
          ARM: 'arm',
          MIPS: 'mips',
          MIPS64: 'mips64',
          X86_32: 'x86-32',
          X86_64: 'x86-64',
        },
        PlatformNaclArch: {
          ARM: 'arm',
          MIPS: 'mips',
          MIPS64: 'mips64',
          X86_32: 'x86-32',
          X86_64: 'x86-64',
        },
        PlatformOs: {
          ANDROID: 'android',
          CROS: 'cros',
          LINUX: 'linux',
          MAC: 'mac',
          OPENBSD: 'openbsd',
          WIN: 'win',
        },
        RequestUpdateCheckStatus: {
          NO_UPDATE: 'no_update',
          THROTTLED: 'throttled',
          UPDATE_AVAILABLE: 'update_available',
        },
      },
    };

    // Pass the Chrome Test.
    // @ts-ignore
    if (!window.chrome || !window.navigator.chrome) {
      // @ts-ignore
      window.chrome = chrome;
      // @ts-ignore
      window.navigator.chrome = chrome;
    }

    // Pass the Permissions Test.
    // @ts-ignore
    const originalQuery = window.navigator.permissions.query;
    // @ts-ignore
    window.navigator.permissions.query = (parameters) => {
      return parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters);
    };
  });
}

async function wrapPage(browser: Browser, page: Page): Promise<Page> {
  // 隐藏 headless 相关属性
  await hideHeadlessAttr(browser, page);

  return page;
}

function getMockBrowser(
  browser: Browser,
  afterPageCreate?: (page: Page) => Promise<void>,
): Browser {
  const openedPages: Page[] = [];

  return new Proxy(browser, {
    get(target, name) {
      if (name === 'newPage') {
        return async () => {
          const page = await Reflect.apply(target[name], target, []);

          if (afterPageCreate) {
            await afterPageCreate(page);
          }

          await wrapPage(browser, page);
          openedPages.push(page);
          return page;
        };
      }

      if (name === 'originClose') {
        return Reflect.get(target, 'close');
      }

      if (name === 'close') {
        return async () => {
          while (openedPages.length > 0) {
            const page = openedPages.shift();
            try {
              // eslint-disable-next-line no-await-in-loop
              await page?.close();
            } catch (e) {
              // do nothing
            }
          }
        };
      }

      return Reflect.get(target, name);
    },
  });
}

export { getMockBrowser, wrapPage };
