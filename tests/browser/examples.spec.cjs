const { test, expect } = require('@playwright/test');
const AxeBuilder = require('@axe-core/playwright').default;
const { pathToFileURL } = require('node:url');
const path = require('node:path');
const fs = require('node:fs');
const root = path.resolve(__dirname, '../..');
const open = (page, name) => page.goto(pathToFileURL(path.join(root, 'examples', name)).href);
const goodExamples = fs.readdirSync(path.join(root, 'examples')).filter(name => name.endsWith('.html') && !name.startsWith('sloppy'));

test('calculator validates boundaries, clears stale quotes and synchronizes controls', async ({ page }) => {
  await open(page, 'deal-pricer.html');
  const seats = page.locator('#seats'), extra = page.locator('#extraN');
  for (const [count, annual] of [[5, '$3,450.00'], [49, '$33,810.00'], [50, '$31,050.00'], [99, '$61,479.00'], [100, '$62,100.00'], [199, '$123,579.00'], [200, '$117,300.00']]) {
    await extra.fill('0'); await seats.fill(String(count));
    await expect(page.locator('#perYear')).toHaveText(annual);
    await expect(page.locator('#onb')).toHaveText(count >= 100 ? 'Free' : '$1,500.00');
    await expect(page.locator('#copy')).toBeEnabled();
  }
  for (const count of ['4', '', '5.5', '-5', '1e100']) {
    await seats.fill(count);
    await expect(seats).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#perYear')).toHaveText('Not available');
    await expect(page.locator('#email')).toHaveValue('');
    await expect(page.locator('#copy')).toBeDisabled();
  }
  await seats.fill('5');
  for (const [discount, status] of [['10', 'Demo quote ready'], ['10.5', "Draft only: needs Robin's approval"], ['20', "Draft only: needs Robin's approval"], ['20.5', 'Prohibited discount: no quote']]) {
    await extra.fill(discount);
    await expect(page.locator('#approval')).toHaveText(status);
    await expect(page.locator('#extra')).toHaveValue(discount);
    if (discount === '10') await expect(page.locator('#copy')).toBeEnabled();
    else await expect(page.locator('#copy')).toBeDisabled();
  }
  for (const value of ['', '-1', '101', '1e100', '.25']) {
    await extra.fill(value);
    await expect(page.locator('#extra')).toBeDisabled();
    await expect(page.locator('#extraErr')).not.toBeEmpty();
    await expect(page.locator('#email')).toHaveValue('');
  }
  await extra.fill('5');
  await page.locator('#extra').focus();
  await page.keyboard.press('ArrowRight');
  await expect(extra).toHaveValue('5.5');
  await page.locator('#bMonthly').click();
  await expect(page.locator('#bMonthly')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#email')).toHaveValue(/per month/);
  await extra.fill('0.5');
  await expect(page.locator('#perMonth')).toHaveText('$343.28');
  await expect(page.locator('#perYear')).toHaveText('$4,119.36');
});

test('copy is guarded and reports success, denial and unavailable clipboard', async ({ page }) => {
  await open(page, 'deal-pricer.html');
  await page.evaluate(() => {
    window.copied = [];
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: {
      writeText: async text => { window.copied.push(text); }
    } });
  });
  await page.locator('#copy').click();
  await expect(page.locator('#copyStatus')).toHaveText('Email copied.');
  expect(await page.evaluate(() => window.copied.length)).toBe(1);
  expect(await page.evaluate(() => window.copied[0])).toContain('Harbor Labs');
  await page.locator('#extraN').fill('20');
  await expect(page.locator('#email')).toHaveValue(/^DRAFT - PENDING APPROVAL/);
  await expect(page.locator('#copy')).toBeDisabled();
  await page.evaluate(() => document.getElementById('copy').onclick());
  expect(await page.evaluate(() => window.copied.length)).toBe(1);
  await page.locator('#extraN').fill('0');
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('denied'); }; });
  await page.locator('#copy').click();
  await expect(page.locator('#copyStatus')).toContainText('Copy failed');
  await expect(page.locator('#email')).toBeFocused();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { value: undefined }));
  await page.locator('#copy').click();
  await expect(page.locator('#copyStatus')).toContainText('Clipboard unavailable');
});

test('guide steps, slide positions and reference filtering work from the keyboard', async ({ page }) => {
  await open(page, 'expense-guide.html');
  await expect(page.locator('#back')).toBeDisabled();
  await page.locator('#next').focus(); await page.keyboard.press('Enter');
  await expect(page.locator('#count')).toHaveText('Step 2 of 5');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#count')).toHaveText('Step 3 of 5');
  await page.locator('#go5').click();
  await expect(page.locator('#count')).toHaveText('Step 5 of 5');
  await page.locator('#next').click();
  await expect(page.locator('#go1')).toHaveAttribute('aria-current', 'step');
  await open(page, 'pitch-slides.html');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#count')).toHaveText('2 / 6');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#waffle i')).toHaveCount(100);
  await expect(page.locator('#waffle i.on')).toHaveCount(87);
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect(page.locator('#next')).toBeDisabled();
  await expect(page.locator('#count')).toHaveText('6 / 6');
  await page.keyboard.press('ArrowLeft');
  await expect(page.locator('#count')).toHaveText('5 / 6');
  await open(page, 'support-cheat-sheet.html');
  await page.keyboard.press('/');
  await expect(page.locator('#q')).toBeFocused();
  await page.locator('#q').fill('refund');
  await expect(page.locator('.item:visible')).toHaveCount(1);
  await page.locator('#q').fill('no-such-demo-question');
  await expect(page.locator('#empty')).toBeVisible();
});

for (const name of goodExamples) {
  for (const colorScheme of ['light', 'dark']) {
    test(`${name}: ${colorScheme} accessibility and responsive overflow`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.emulateMedia({ colorScheme, reducedMotion: 'reduce' });
      for (const width of [1440, 400, 320]) {
        await page.setViewportSize({ width, height: 900 });
        await open(page, name);
        const states = name === 'pitch-slides.html' ? 6 : name === 'expense-guide.html' ? 5 : 1;
        if (name === 'hiring-dashboard.html') await page.locator('summary').click();
        for (let state = 0; state < states; state++) {
          expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${name}, ${width}, state ${state}`).toBe(true);
          if (name === 'expense-guide.html') {
            const content = await page.locator('.step:visible').boundingBox();
            const navigation = await page.locator('.nav').boundingBox();
            expect(navigation.y, 'Navigation must not cover guide content').toBeGreaterThanOrEqual(content.y + content.height);
          }
          const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
          expect(results.violations.map(v => ({
            id: v.id, nodes: v.nodes.map(n => ({ target: n.target, summary: n.failureSummary }))
          }))).toEqual([]);
          if (state < states - 1) await page.locator('#next').click();
        }
      }
      expect(errors).toEqual([]);
    });
  }
}

test('Noslop focus stays visible and reduced motion disables animations', async ({ page }) => {
  await open(page, 'deal-pricer.html');
  await page.locator('#seats').focus();
  expect(await page.locator('#seats').evaluate(el => getComputedStyle(el).outlineStyle)).not.toBe('none');
  await page.keyboard.press('Tab');
  await expect(page.locator('#bAnnual')).toBeFocused();
  await open(page, 'pitch-slides.html');
  expect(await page.locator('.slide .wrap').first().evaluate(el => getComputedStyle(el).animationName)).toBe('none');
});
