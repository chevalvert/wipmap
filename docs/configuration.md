# wipmap / docs / configuration

The default configuration file for `wipmap` is [`wipmap.config.json`](../wipmap.config.json).  

You can specify your own config file with the `-c, --config` flag:

```sh
$ wipmap --config path/to/my/config.json
```

Use the `-l, --live` flag to allow the server to re-read all config files (including external config files) on request:

```sh
$ wipmap --live --config path/to/my/config.json
```
<sup>Note that in production, the `-l, --live` flag shouldn't be used, as it is far more efficient to request a cached config.</sup>

<br>

## Reference

_You can find the default configuration in [`wipmap.config.json`](../wipmap.config.json)._

### `remotes`
- `max`: Number of maximum simultaneous remote connections. A value of `0` disables this limitation.
- `colors`: Array of CSS valid remote colors.

---
### `plotter`
#### `signature`
- `enable`: Enable or disable the signature function.
- `prefix`: Arbitratry string appended before the map timestamp.
- `fontSize`: Size of the signature in millimeters.

#### `move`
- `maxLength`: Maximum length of the stroke used to move the pencil, in millimeters.
- `scale`: Scale factor of the canvas. A value of `100` means that the canvas will be scaled to approximatively 100 millimeters.
- `speed`: Speed setting for the plotter, from `0` to `1`. A value of `-1` disable this setting, allowing the plotter to fallback to the default non-linear speed.

#### `draw`
- `maxLines`: Maximum length of lines allowed for a drawing. 
- `maxLength`: Maximum length of all strokes of the drawing, in millimeters.
- `scale`: Scale factor of the drawing. A value of `10` means that the drawing will be scaled to approximatively 10 millimeters.
- `speed`: Speed setting for the plotter, from `0` to `1`. A value of `-1` disable this setting, allowing the plotter to fallback to the default non-linear speed.

---
### `wipmap-generate`
See [`wipmap-generate`](https://github.com/chevalvert/wipmap-generate).

---
### `gameover`
- `landmarksLength`: Maximum number of landmarks to end a map.
- `duration`: Duration of the gameover screen in seconds.
---
### `fog`
- `enable`: Enable or disable the fog of war.
- `color`: CSS valid color of the fog.

---
### `agent`
- `speed`: Speed of the agent.
- `fov`: Radius of the agent fov.

#### `inertia`
See [`utils/inertia.js`](../src/utils/inertia.js).
