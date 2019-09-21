import { CoverageEntry } from 'puppeteer';

jest.setTimeout(20000); // 20s

beforeAll(async () => {
  await Promise.all([page.coverage.startJSCoverage(), page.coverage.startCSSCoverage()]);
});

beforeEach(async () => {
  await page.goto('http://localhost:8080');
});

afterAll(async () => {
  const [jsCoverage, cssCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
    page.coverage.stopCSSCoverage()
  ]);

  function computeCoverage(entries: CoverageEntry[]) {
    let totalBytes = 1; // Cannot be 0 otherwise usedBytes / totalBytes gives a NaN
    let usedBytes = 0;
    entries.forEach(entry => {
      totalBytes += entry.text.length;
      entry.ranges.forEach(range => {
        usedBytes += range.end - range.start - 1;
      });
    });
    totalBytes /= 1024;
    usedBytes /= 1024;
    return `${Math.round((usedBytes / totalBytes) * 100)}% (${Math.round(usedBytes)}/${Math.round(
      totalBytes
    )} KiB)`;
  }

  console.log(`JavaScript coverage: ${computeCoverage(jsCoverage)}`);
  console.log(`CSS coverage: ${computeCoverage(cssCoverage)}`);
});

test('Navigation', async () => {
  {
    await page.waitFor('section.card > div.card-body > h5.card-title');

    const heroes = await page.$$('section.card');
    expect(heroes).toHaveLength(50);

    const firstHeroCard = heroes[0];
    await expect(await firstHeroCard.$('h5.card-title')).toMatch('3-D Man');

    const link = (await firstHeroCard.$('div.card-footer > a'))!;
    await link.click();
    // See [waitForNavigation doesn't work after clicking a link](https://github.com/GoogleChrome/puppeteer/issues/1412)
    //await page.waitForNavigation();
    await page.waitFor('section.hero');

    const hero = (await page.$('section.hero'))!;
    await expect(await hero.$eval('p', node => (node as HTMLElement).innerText)).toEqual(''); // No description
    await expect(await hero.$('p')).toMatch(''); // No description
    await expect(await hero.$eval('h3', node => (node as HTMLElement).innerText)).toEqual(
      '3-D Man'
    );
    await expect(await hero.$('h3')).toMatch('3-D Man');
  }

  await page.goBack();

  {
    await page.waitFor('section.card > div.card-body > h5.card-title');

    const heroes = await page.$$('section.card');
    expect(heroes).toHaveLength(50);

    const thirdHeroCard = heroes[2];
    await expect(
      await thirdHeroCard.$eval('h5.card-title', node => (node as HTMLElement).innerText)
    ).toEqual('A.I.M.');
    await expect(await thirdHeroCard.$('h5.card-title')).toMatch('A.I.M.');

    const link = (await thirdHeroCard.$('div.card-footer > a'))!;
    await link.click();
    // See [waitForNavigation doesn't work after clicking a link](https://github.com/GoogleChrome/puppeteer/issues/1412)
    //await page.waitForNavigation();
    await page.waitFor('section.hero');

    const hero = (await page.$('section.hero'))!;
    await expect(await hero.$eval('p', node => (node as HTMLElement).innerText)).toEqual(
      'AIM is a terrorist organization bent on destroying the world.'
    );
    await expect(await hero.$('p')).toMatch(
      'AIM is a terrorist organization bent on destroying the world.'
    );
    await expect(await hero.$eval('h3', node => (node as HTMLElement).innerText)).toEqual('A.I.M.');
    await expect(await hero.$('h3')).toMatch('A.I.M.');
  }

  await page.goBack();

  {
    await page.waitFor('section.card > div.card-body > h5.card-title');

    const heroes = await page.$$('section.card');
    expect(heroes).toHaveLength(50);

    const lastHeroCard = heroes[49];
    await expect(
      await lastHeroCard.$eval('h5.card-title', node => (node as HTMLElement).innerText)
    ).toEqual('Annihilus');
    await expect(await lastHeroCard.$('h5.card-title')).toMatch('Annihilus');

    const link = (await lastHeroCard.$('div.card-footer > a'))!;
    await link.click();
    // See [waitForNavigation doesn't work after clicking a link](https://github.com/GoogleChrome/puppeteer/issues/1412)
    //await page.waitForNavigation();
    await page.waitFor('section.hero');

    const hero = (await page.$('section.hero'))!;
    await expect(await hero.$eval('p', node => (node as HTMLElement).innerText)).toEqual(''); // No description
    await expect(await hero.$('p')).toMatch(''); // No description
    await expect(await hero.$eval('h3', node => (node as HTMLElement).innerText)).toEqual(
      'Annihilus'
    );
    await expect(await hero.$('h3')).toMatch('Annihilus');
  }
});
