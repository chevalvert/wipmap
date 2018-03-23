# wipmap [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)

<br>

## Installation

<pre>
$ git clone https://github.com/chevalvert/wipmap
$ cd wipmap
$ <a href="https://yarnpkg.com/en/docs/install">yarn</a> install
</pre>

## Usage

```
wipmap

Usage:
  wipmap --open --live
  wipmap -of --log=<PATH> --data=<PATH> --config=<PATH>
  wipmap -l --data=<PATH> --config=<PATH> --landmark-packs=<PATH>
  wipmap --plotter
  wipmap --help
  wipmap --version

Flags:
  -l, --live              Enable hot reloading of config file.
  -o, --open              Open browser.
  -f, --fullscreen        Open browser in kiosk mode.
  --plotter               Run the server in plotter mode.
  -h, --help              Show this screen.
  -v, --version           Print the current version.
  --no-default-pack       Run wipmap without loading default landmarks.

Options:
  -c, --config            Run the server with specified config file.
  -d, --data=<PATH>       Specify data/ export directory.
  -p, --port=<PORT>       Run server on custom port (default is 8888).
  --landmark-packs=<PATH> Run the server with external landmarks packs.
  --log=<PATH>            Pipe stdout to the specified log file.
  --log-level=<LEVEL>     Set the log level (default is 'info').

Log level:
  0, emergency            System is unusable.
  1, alert                Action must be taken immediately.
  2, critical             The system is in critical condition.
  3, error                Error condition.
  4, warning              Warning condition.
  5, notice               A normal but significant condition.
  6, info                 A purely informational message.
  7, debug                Messages to debug an application.

```

## Configuration

See [`docs/configuration.md`](docs/configuration.md)

<sup>For more details about map generation and configuration, see [`wipmap-generate`](https://github.com/chevalvert/wipmap-generate).</sup>

## External landmark packs

See [`docs/landmark-packs.md`](docs/landmark-packs.md).

<!-- 
## Map texture

See [`docs/texture.md`](docs/texture.md).
-->

## Multilang

See [`src/loc.js`](src/loc.js)

<sup>Note that you'll need to rebuild `src/` to `build/` using `yarn build` or `npm run build`.</sup>

## License
[MIT.](https://tldrlegal.com/license/mit-license)
