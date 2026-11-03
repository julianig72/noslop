(function () {
  "use strict";
  var api = window.NoslopPricing;
  var $ = function (id) {
    return document.getElementById(id);
  };
  var annual = true,
    revision = 0;

  function render() {
    revision++;
    $("copyStatus").textContent = "";
    var result = api.calculate($("seats").value, annual, $("extraN").value);
    var sliderValue = Number($("extraN").value);
    var sliderValid =
      $("extraN").value.trim() !== "" &&
      Number.isFinite(sliderValue) &&
      sliderValue >= 0 &&
      sliderValue <= 100 &&
      Number.isInteger(sliderValue * 2);
    $("extra").disabled = !sliderValid;
    if (sliderValid) $("extra").value = String(sliderValue);
    $("sliderHint").textContent = sliderValid
      ? ""
      : "Slider unavailable until the discount is a valid number.";
    ["seats", "extra"].forEach(function (field) {
      var error = result.errors[field] || "";
      $(field === "seats" ? "seatErr" : "extraErr").textContent = error;
      $(field === "seats" ? "seats" : "extraN").setAttribute(
        "aria-invalid",
        String(Boolean(error)),
      );
    });
    $("extra").setAttribute(
      "aria-invalid",
      String(Boolean(result.errors.extra)),
    );
    var status = $("approval");
    status.className =
      "pill " +
      (result.status === "ready"
        ? "good"
        : result.status === "pending"
          ? "watch"
          : "bad");
    status.textContent = {
      ready: "Demo quote ready",
      pending: "Draft only: needs Robin's approval",
      prohibited: "Prohibited discount: no quote",
      invalid: "Correct the inputs: no quote",
    }[result.status];
    $("copy").disabled = !result.canCopy;
    $("email").value = "";
    $("bars").replaceChildren();
    $("yearLbl").textContent = annual
      ? "Subscription per year, billed annually"
      : "Subscription per year, billed monthly";
    if (result.status === "invalid" || result.status === "prohibited") {
      ["perYear", "perMonth", "perSeat", "onb"].forEach(function (id) {
        $(id).textContent = "Not available";
      });
      return result;
    }
    $("perYear").textContent = api.money(result.perYear);
    $("perMonth").textContent = api.money(result.perMonth);
    $("perSeat").textContent = api.money(result.perSeat);
    $("onb").textContent = result.onboarding
      ? api.money(result.onboarding)
      : "Free";
    var rows = [
      ["List subscription", result.list],
      ["Volume " + result.volume + "% off", -result.volumeOff],
      ["Extra " + result.extra + "% off", -result.extraOff],
      ["Onboarding", result.onboarding],
      ["First-year total", result.firstYear],
    ];
    rows.forEach(function (item, index) {
      var row = document.createElement("div");
      row.className = "bar" + (index === rows.length - 1 ? " final" : "");
      var label = document.createElement("span"),
        track = document.createElement("div");
      var fill = document.createElement("div"),
        value = document.createElement("span");
      label.textContent = item[0];
      track.className = "track";
      track.setAttribute("aria-hidden", "true");
      fill.className = "fill";
      fill.style.width =
        (Math.abs(item[1]) / (result.list + result.onboarding)) * 100 + "%";
      track.appendChild(fill);
      value.className = "v";
      value.textContent = api.money(item[1]);
      row.append(label, track, value);
      $("bars").appendChild(row);
    });
    $("email").value =
      result.status === "pending"
        ? "DRAFT - PENDING APPROVAL. Not a client quote.\n" +
          "Robin must approve the requested " +
          result.extra +
          "% extra discount outside this demo.\n" +
          "Estimated first-year total: " +
          api.money(result.firstYear) +
          ".\n" +
          "This demo cannot record or grant approval."
        : api.quote(result, $("client").value, $("contact").value, new Date());
    return result;
  }

  $("bAnnual").onclick = function () {
    annual = true;
    $("bAnnual").setAttribute("aria-pressed", "true");
    $("bMonthly").setAttribute("aria-pressed", "false");
    render();
  };
  $("bMonthly").onclick = function () {
    annual = false;
    $("bAnnual").setAttribute("aria-pressed", "false");
    $("bMonthly").setAttribute("aria-pressed", "true");
    render();
  };
  $("extra").oninput = function () {
    $("extraN").value = this.value;
    render();
  };
  ["seats", "extraN", "client", "contact"].forEach(function (id) {
    $(id).oninput = render;
  });

  $("copy").onclick = async function () {
    // Revalidate at the action boundary; never copy a stale result.
    var result = render(),
      currentRevision = revision;
    if (!result.canCopy) return;
    if (!navigator.clipboard || !navigator.clipboard.writeText) {
      $("copyStatus").textContent =
        "Clipboard unavailable. Select the email and copy it manually.";
      $("email").focus();
      $("email").select();
      return;
    }
    try {
      await navigator.clipboard.writeText($("email").value);
      if (revision === currentRevision)
        $("copyStatus").textContent = "Email copied.";
    } catch (error) {
      if (revision !== currentRevision) return;
      $("copyStatus").textContent =
        "Copy failed. Select the email and copy it manually.";
      $("email").focus();
      $("email").select();
    }
  };
  render();
})();
