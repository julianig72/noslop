(function (root) {
  "use strict";

  function number(value) {
    if (typeof value !== "number" && typeof value !== "string") return NaN;
    if (typeof value === "string" && value.trim() === "") return NaN;
    return Number(value);
  }

  function calculate(seatInput, annual, extraInput) {
    var seats = number(seatInput),
      extra = number(extraInput),
      errors = {};
    if (!Number.isSafeInteger(seats) || seats < 5) {
      errors.seats = "Enter a whole number of seats, at least 5.";
    } else if (!Number.isSafeInteger(seats * 82800 * 200 + 150000)) {
      errors.seats = "Seat count is too large to calculate safely in cents.";
    }
    if (
      !Number.isFinite(extra) ||
      extra < 0 ||
      extra > 100 ||
      !Number.isInteger(extra * 2)
    ) {
      errors.extra = "Enter a discount from 0 to 100 in steps of 0.5%.";
    }
    if (typeof annual !== "boolean")
      errors.billing = "Select annual or monthly billing.";
    if (Object.keys(errors).length)
      return { status: "invalid", errors: errors, canCopy: false };
    if (extra > 20) {
      return {
        status: "prohibited",
        errors: { extra: "Extra discounts above 20% are not allowed." },
        canCopy: false,
      };
    }
    var listCents = seats * (annual ? 69000 : 82800);
    var volume = seats >= 200 ? 15 : seats >= 50 ? 10 : 0;
    // Apply volume first, then extra; round once per actual billing period.
    var afterVolume = (listCents * (100 - volume)) / 100;
    var billedCents = Math.round(
      ((annual ? afterVolume : afterVolume / 12) * (200 - extra * 2)) / 200,
    );
    var yearlyCents = annual ? billedCents : billedCents * 12;
    var onboardingCents = seats >= 100 ? 0 : 150000;
    return {
      status: extra > 10 ? "pending" : "ready",
      errors: {},
      canCopy: extra <= 10,
      seats: seats,
      annual: annual,
      extra: extra,
      list: listCents / 100,
      volume: volume,
      volumeOff: (listCents - afterVolume) / 100,
      extraOff: (afterVolume - yearlyCents) / 100,
      perYear: yearlyCents / 100,
      perMonth: yearlyCents / 1200,
      perSeat: yearlyCents / 1200 / seats,
      onboarding: onboardingCents / 100,
      firstYear: (yearlyCents + onboardingCents) / 100,
    };
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }

  function quote(result, client, contact, date) {
    if (result.status !== "ready" || !result.canCopy) return "";
    var valid = new Date(date);
    if (!Number.isFinite(valid.getTime()))
      throw new RangeError("A valid quote date is required.");
    valid.setDate(valid.getDate() + 30);
    return [
      "Hi " + (contact.trim() || "there") + ",",
      "",
      "Here is the Team plan quote for " + (client.trim() || "your team") + ":",
      "- Seats: " + result.seats,
      "- Billing: " + (result.annual ? "annual" : "monthly"),
      "- Subscription: " +
        money(result.annual ? result.perYear : result.perMonth) +
        (result.annual ? " per year" : " per month"),
      "- Per seat per month: " + money(result.perSeat),
      "- Volume discount: " + result.volume + "%",
      "- Extra discount (after volume): " + result.extra + "%",
      "- Onboarding (one-time): " + money(result.onboarding),
      "- First-year total: " + money(result.firstYear),
      "- Valid until: " +
        valid.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      "",
      "Happy to answer any questions.",
    ].join("\n");
  }

  var api = { calculate: calculate, quote: quote, money: money };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.NoslopPricing = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
