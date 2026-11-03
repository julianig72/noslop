const { test } = require('node:test');
const assert = require('node:assert/strict');
const { calculate, quote } = require('../examples/deal-pricer.js');

test('seat thresholds preserve prices, volume and onboarding rules', () => {
  const expected = [
    [5, 0, 3450, 1500],
    [49, 0, 33810, 1500],
    [50, 10, 31050, 1500],
    [99, 10, 61479, 1500],
    [100, 10, 62100, 0],
    [199, 10, 123579, 0],
    [200, 15, 117300, 0],
  ];
  for (const [seats, volume, perYear, onboarding] of expected) {
    const result = calculate(seats, true, 0);
    assert.equal(result.status, 'ready');
    assert.equal(result.volume, volume);
    assert.equal(result.perYear, perYear);
    assert.equal(result.onboarding, onboarding);
    assert.equal(result.firstYear, perYear + onboarding);
    assert.equal(result.perSeat, perYear / 12 / seats);
  }
});

test('extra applies after volume, with cent rounding and monthly billing', () => {
  const annual = calculate(60, true, 5);
  assert.equal(annual.perYear, 35397);
  assert.equal(annual.firstYear, 36897);
  assert.equal(annual.perMonth, 2949.75);
  const monthly = calculate(5, false, 0);
  assert.equal(monthly.perMonth, 345);
  assert.equal(monthly.perSeat, 69);
  assert.equal(monthly.firstYear, 5640);
  assert.equal(calculate(5, true, .5).perYear, 3432.75);
  const roundedMonthly = calculate(5, false, .5);
  assert.equal(roundedMonthly.perMonth, 343.28);
  assert.equal(roundedMonthly.perYear, 4119.36);
  assert.equal(roundedMonthly.firstYear, 5619.36);
  assert.match(quote(roundedMonthly, '', '', new Date()), /\$343\.28 per month/);
});

test('10 inclusive is ready; above 10 through 20 is pending; above 20 is prohibited', () => {
  for (const [discount, status] of [[0, 'ready'], [10, 'ready'], [10.5, 'pending'], [20, 'pending'], [20.5, 'prohibited'], [100, 'prohibited']]) {
    const result = calculate(50, true, discount);
    assert.equal(result.status, status);
    assert.equal(result.canCopy, status === 'ready');
    if (status === 'prohibited') assert.equal(result.perYear, undefined);
  }
});

test('empty, fractional, negative, nonfinite and unsafe seat counts do not calculate', () => {
  for (const seats of ['', ' ', 4, 0, -5, 5.5, NaN, Infinity, -Infinity, 'Infinity', 'abc', null, false, {}, Number.MAX_SAFE_INTEGER]) {
    const result = calculate(seats, true, 0);
    assert.equal(result.status, 'invalid', String(seats));
    assert.ok(result.errors.seats);
    assert.equal(result.canCopy, false);
    assert.equal(result.perYear, undefined);
  }
});

test('discounts require finite values in range and half-percent increments', () => {
  for (const extra of ['', ' ', -1, 100.5, 101, .25, NaN, Infinity, -Infinity, 'Infinity', 'abc', null, true]) {
    const result = calculate(5, true, extra);
    assert.equal(result.status, 'invalid', String(extra));
    assert.ok(result.errors.extra);
    assert.equal(result.perYear, undefined);
  }
  assert.equal(calculate('5', true, '10').status, 'ready');
  assert.equal(calculate(5, 'annual', 0).status, 'invalid');
});

test('only ready results generate a quote, with 30 calendar days validity', () => {
  const date = new Date(2026, 10, 3, 12);
  for (const result of [calculate(4, true, 0), calculate(5, true, 10.5), calculate(5, true, 20.5)]) {
    assert.equal(quote(result, 'Harbor Labs', 'Jordan', date), '');
  }
  const text = quote(calculate(60, true, 5), 'Harbor Labs', 'Jordan', date);
  assert.match(text, /Hi Jordan,/);
  assert.match(text, /\$35,397\.00 per year/);
  assert.match(text, /December 3, 2026/);
  assert.match(text, /Extra discount \(after volume\): 5%/);
  const monthly = quote(calculate(5, false, 0), '', '', date);
  assert.match(monthly, /\$345\.00 per month/);
  assert.match(monthly, /your team/);
  assert.throws(() => quote(calculate(5, true, 0), '', '', 'invalid'), RangeError);
});
