# LUTE's In C App (Web Edition)

This is a Web Audio-based reimplementation of the Loyola University Technology
Ensemble's Max application for performing Terry Riley's *'In C'*. It is
currently in active development and should be considered alpha-quality. After
completion, this app should support most modern browsers and have a responsive
design supporting mobile, tablets, and laptops.

## Development

### Prerequisites

* [npm][npm]
* [Lilypond][ly] (minimum required version: `2.19.80`)

[npm]: https://www.npmjs.com/
[ly]: https://lilypond.org/

### Live Development

If you are contributing to this project there is a build script that will watch
the source directory for any changes, dynamically rebuild the JS and CSS bundles, and host a web server. Requires [npm][npm]:

```
$ npm run serve
```

### Deploying new releases

Releases are hosted on GitHub and generated from the upstream `gh-pages` branch
of this repository. Deploying a new release is handled by an npm build script.
Only LUTE members are able to deploy new releases, but if you happen to be
creating your own fork this should work for you assuming that your remote is
called `upstream`.

```
$ npm run deploy
```
