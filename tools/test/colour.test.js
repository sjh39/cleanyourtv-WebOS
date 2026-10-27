// The tile colour of a launcher icon (app/src/js/colour.js): cornerColour() gives the colour of a picture's own flat background, taken
// from its four corners, and nothing when the corners are not alike (a gradient, a transparent corner). colour.js has only function
// declarations, so it is loaded as it is, without a browser.
const fs = require('fs'),
  path = require('path'),
  vm = require('vm');
const { root, ok, run } = require('./lib');

run(async () => {
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'app', 'src', 'js', 'colour.js'), 'utf8'), sandbox, { filename: 'colour.js' });
  const N = 32;
  // an N x N picture in RGBA: the colour of each corner (3 x 3 pixels, as cornerColour reads them) or a transparent one; the rest is art
  function picture(corners) {
    const d = new Uint8ClampedArray(N * N * 4);
    for (let i = 0; i < N * N; i++) {
      d[i * 4] = 200;
      d[i * 4 + 1] = 30;
      d[i * 4 + 2] = 90;
      d[i * 4 + 3] = 255;
    }
    const at = [
      [0, 0],
      [N - 3, 0],
      [0, N - 3],
      [N - 3, N - 3],
    ];
    corners.forEach((c, k) => {
      for (let a = 0; a < 3; a++)
        for (let b = 0; b < 3; b++) {
          const j = ((at[k][1] + b) * N + at[k][0] + a) * 4;
          d[j] = c[0];
          d[j + 1] = c[1];
          d[j + 2] = c[2];
          d[j + 3] = c.length > 3 ? c[3] : 255;
        }
    });
    return d;
  }
  const four = v => [v, v, v, v];
  const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);

  ok(typeof sandbox.cornerColour === 'function', 'colour.js has cornerColour');
  ok(eq(sandbox.cornerColour(picture(four([0, 0, 0])), N), [0, 0, 0]), 'flat black corners give black (a logo on black)');
  ok(eq(sandbox.cornerColour(picture(four([255, 255, 255])), N), [255, 255, 255]), 'flat white corners give white');
  ok(eq(sandbox.cornerColour(picture(four([20, 40, 60])), N), [20, 40, 60]), 'flat corners of another colour give that colour');
  ok(
    eq(
      sandbox.cornerColour(
        picture([
          [10, 10, 10],
          [10, 10, 10],
          [10, 10, 10],
          [14, 14, 14],
        ]),
        N
      ),
      [11, 11, 11]
    ),
    'nearly equal corners give their average, rounded'
  );
  ok(
    sandbox.cornerColour(
      picture([
        [0, 0, 0],
        [0, 0, 0],
        [255, 255, 255],
        [255, 255, 255],
      ]),
      N
    ) === null,
    'a gradient (dark above, light below) gives nothing'
  );
  ok(
    sandbox.cornerColour(
      picture([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [60, 60, 60],
      ]),
      N
    ) === null,
    'corners that differ too much give nothing'
  );
  ok(
    sandbox.cornerColour(
      picture([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0, 0],
      ]),
      N
    ) === null,
    'a transparent corner gives nothing'
  );
  ok(
    sandbox.cornerColour(
      picture([
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0],
        [0, 0, 0, 200],
      ]),
      N
    ) === null,
    'a corner that is only partly opaque gives nothing'
  );
});
