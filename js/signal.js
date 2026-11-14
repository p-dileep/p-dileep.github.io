// Noise demo on the Research page: the same samples, smeared more as the signal weakens.
(function () {
  var demo = document.getElementById("signal-demo");
  if (!demo) return;
  var canvas = demo.querySelector("canvas");
  var slider = demo.querySelector("input[type=range]");
  var out = demo.querySelector("output");
  var ctx = canvas.getContext("2d");
  var N = 700;

  function ring(n, r) {
    var pts = [];
    for (var k = 0; k < n; k++) pts.push([r * Math.cos((2 * Math.PI * k) / n), r * Math.sin((2 * Math.PI * k) / n)]);
    return pts;
  }
  function grid(levels) {
    var pts = [];
    levels.forEach(function (x) { levels.forEach(function (y) { pts.push([x, y]); }); });
    return pts;
  }
  // Every pattern is scaled to the same average power.
  var s2 = Math.SQRT1_2, q = 1 / Math.sqrt(10);
  var MODS = {
    BPSK: [[-1, 0], [1, 0]],
    QPSK: grid([-s2, s2]),
    "8PSK": ring(8, 1),
    "16QAM": grid([-3 * q, -q, q, 3 * q])
  };

  // Fixed draws, so dragging the slider scales the same cloud instead of reshuffling it.
  function gauss() {
    var u = 1 - Math.random(), v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  var noise = [], pick = [];
  for (var i = 0; i < N; i++) { noise.push([gauss(), gauss()]); pick.push(Math.random()); }

  function draw() {
    var mod = demo.querySelector("input[name=mod]:checked").value;
    var pts = MODS[mod];
    var snr = Number(slider.value);
    out.textContent = snr + " dB";
    var sigma = Math.sqrt(1 / (2 * Math.pow(10, snr / 10)));

    var css = getComputedStyle(document.documentElement);
    var size = canvas.clientWidth, dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);

    var mid = size / 2, scale = size / 4.6;
    ctx.strokeStyle = css.getPropertyValue("--rule");
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(mid, 8); ctx.lineTo(mid, size - 8);
    ctx.moveTo(8, mid); ctx.lineTo(size - 8, mid);
    ctx.stroke();

    ctx.fillStyle = css.getPropertyValue("--red");
    ctx.globalAlpha = 0.55;
    for (var i = 0; i < N; i++) {
      var p = pts[Math.floor(pick[i] * pts.length)];
      var x = mid + (p[0] + sigma * noise[i][0]) * scale;
      var y = mid - (p[1] + sigma * noise[i][1]) * scale;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, 2 * Math.PI);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  demo.addEventListener("input", draw);
  window.addEventListener("resize", draw);
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", draw);
  draw();
})();
