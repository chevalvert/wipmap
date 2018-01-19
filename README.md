# wipmap [<img src="https://github.com/chevalvert.png?size=100" align="right">](http://chevalvert.fr/)

<br>
<br>
<br>

![preview.png](https://github.com/chevalvert/wipmap/raw/assets/preview.png)

## Usage

```
wipmap

Usage:
  wipmap --open
  wipmap --open --fullscreen
  wipmap --help
  wipmap --version

Options:
  -o, --open              Open browser.
  -f, --fullscreen        Open browser in kiosk mode.
  -h, --help              Show this screen.
  -v, --version           Print the current version.
```

<br>

## Installation

```sh
git clone https://github.com/chevalvert/wipmap
yarn install # or npm install
```

<br>

## Configuration

### Server configuration
See [`server.config.json`](server.config.json).

<sup>For more details about map generation and configuration, see [`wipmap-generate`](https://github.com/chevalvert/wipmap-generate).</sup>

### Advanced configuration

For more advanced configuration, see [`src/config.js`](src/config.js)

<sup>Note that you'll need to rebuild `src/` using `yarn build` or `npm run build`.</sup>

### Multi-lang

See [`src/loc.js`](src/loc.js)

<sup>Note that you'll need to rebuild `src/` using `yarn build` or `npm run build`.</sup>

<br>

## License
[MIT.](https://tldrlegal.com/license/mit-license)
