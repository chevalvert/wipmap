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
  wipmap --open
  wipmap -of --log=<path> --data=<path> --config<path>
  wipmap --log-level=debug --config=<path>
  wipmap --help
  wipmap --version

Options:
  -c, --config            Run server with specified config file.
  -d, --data              Specify data/ export directory.
  -o, --open              Open browser.
  -p, --port=<PORT>       Run server on custom port (default is 8888).
  -f, --fullscreen        Open browser in kiosk mode.
  -h, --help              Show this screen.
  -v, --version           Print the current version.
  --log=<path>            Pipe stdout to the specified log file.
  --log-level=<level>     Set the log level (default is 'info').

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

See [docs/configuration.md](docs/configuration.md)

<sup>For more details about map generation and configuration, see [`wipmap-generate`](https://github.com/chevalvert/wipmap-generate).</sup>

## Multi-lang

See [`src/loc.js`](src/loc.js)

<sup>Note that you'll need to rebuild `src/` to `build/` using `yarn build` or `npm run build`.</sup>

## License
[MIT.](https://tldrlegal.com/license/mit-license)
