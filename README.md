# LUTE's In C App (Web Edition)

This is a Web Audio-based reimplementation of the Loyola University Technology
Ensemble's Max application for performing Terry Riley's *'In C'*. It is
currently in active development and should be considered alpha-quality. After
completion, this app should support most modern browsers and have a responsive
design supporting mobile, tablets, and laptops.

## Development

If you are contributing to this project there is a build script that will watch
the source directory for any changes and dynamically rebuild the JS and CSS bundles. Requires [npm][npm]:

```
$ npm run watch
```

[npm]: https://www.npmjs.com/

### Phrase SVG Generation

Building new SVG images for each phrase requires [Lilypond][ly]. The Lilypond
source files can be found in `assets/ly` and generating SVGs from them is
automated by a build script in the same directory:

```
$ cd assets/ly
$ ./build.sh
```

[ly]: https://lilypond.org/
