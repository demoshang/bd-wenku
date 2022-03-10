import { ElementHandle, Page } from 'puppeteer-core';
import { mapSeries } from '../common/promise';
import { getBrowser } from '../puppeteer';

async function getTitle(page: Page) {
  const title = await page.$eval('body', (el) => {
    try {
      // @ts-ignore
      return require.data.get('WkInfo').DocInfo.title;
    } catch (e) {
      const txt = (el as HTMLBodyElement).innerText;

      const title = txt.trim().split('\n')[0]?.substring(0, 30);
      return title;
    }
  });

  return `${title}-${Date.now()}`;
}

async function fillHtml(page: Page, list: string[]) {
  const headHtml = await page.$eval('head', (el) => {
    const cleanlyEle = document.createElement('div');
    cleanlyEle.appendChild(el.cloneNode(true));

    const cleanHead = cleanlyEle.querySelector('head')!;

    const list = [...cleanHead.querySelectorAll('script')];
    list.forEach((e) => {
      cleanHead.removeChild(e);
    });

    return cleanHead.innerHTML;
  });

  return [
    headHtml,
    `
  <body>
  <div class="reader-container" style="width:800px;">
  <div class="reader-container-inner">
  `,
    ...list,

    `
  </div>
  </div>
  </body>`,
  ]
    .join('\n')
    .replace(/href="\/\//g, 'href="https://');
}

async function onePage(page: Page, eleHandle: ElementHandle<Element>) {
  return page.evaluate((ele) => {
    ele.scrollIntoView();

    let intervalTimer: any = null;
    let timeoutTimer: any = null;

    return new Promise<string>((resolve, reject) => {
      ele.scrollIntoView();

      intervalTimer = setInterval(() => {
        let itemEle =
          ele.querySelector('.reader-txt-layer') ||
          ele.querySelector('.reader-pic-layer');

        if (itemEle) {
          resolve(ele.outerHTML);
        }
      }, 1000);

      timeoutTimer = setTimeout(() => {
        reject(new Error('timeout'));
      }, 10 * 1000);
    }).finally(() => {
      clearInterval(intervalTimer);
      clearTimeout(timeoutTimer);
    });
  }, eleHandle);
}

async function getPageHtml(page: Page) {
  const renderEleHandleList = await page.$$('.reader-page');

  const list = await mapSeries(renderEleHandleList, (ele) => {
    return onePage(page, ele);
  });

  return fillHtml(page, list);
}

async function getHtml(u: string | Page) {
  let p: Page;
  if (typeof u === 'string') {
    const browser = await getBrowser({ headless: true });
    const page = await browser.newPage();
    await page.goto(u, { waitUntil: 'networkidle0' });
    p = page;
  } else {
    p = u;
  }

  return Promise.all([getTitle(p), getPageHtml(p)]).then(([title, html]) => {
    return { title, html };
  });
}

export { getHtml };
