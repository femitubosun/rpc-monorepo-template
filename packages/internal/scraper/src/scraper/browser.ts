import { makeError } from '@template/error';
import { makeLogger } from '@template/logging';
import { chromium, type Page } from 'playwright';

const logger = makeLogger('Browser');

class Browser {
  async browse(url: string): Promise<Page> {
    try {
      const browser = await chromium.launch();

      const page = browser.newPage();
      (await page).goto(url);

      return page;
    } catch (e) {
      logger.error('Could not browse page', e);
      throw makeError({
        type: 'INTERNAL',
        message: `Could not browse page @ ${url}`,
      });
    }
  }
}

const browser = new Browser();

export default browser;
