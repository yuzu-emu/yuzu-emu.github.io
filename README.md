This repo contains the sources for the yuzu-emu website at https://yuzu-emu.org/

# Local Development

Prerequisites:

* `git`
* `yarn`
* `graphicsmagick` (`apt install graphicsmagick` on Debian/Ubuntu)

Steps to run:

1. Run `git submodule init && git submodule update`
2. Install dependencies by running `yarn`
3. Set the `GITHUB_WIKI_URL` and `TENANT` enivironment variables:
    ```bash
    export GITHUB_WIKI_URL=https://github.com/yuzu-emu/yuzu.wiki.git
    export TENANT=yuzu
    ```
3. Run `yarn serve` to watch files and serve on http://localhost:1313 or `yarn build` to compile a static version.
