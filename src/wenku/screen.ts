import { getBrowser } from '../puppeteer';

async function screen(html: string, path: string) {
  const browser = await getBrowser();
  const page = await browser.newPage();

  await page.evaluate((html) => {
    document.write(html);

    return new Promise((resolve) => {
      setTimeout(resolve, 3000);
    });
  }, html);

  await page.screenshot({ path, fullPage: true });

  // await page.pdf({ path, width: '800px' });
}

export { screen };
