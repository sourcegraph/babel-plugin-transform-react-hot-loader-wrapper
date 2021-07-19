# Warning

This repository is archived because of the migration to [react-refresh-webpack-plugin](react-refresh-webpack-plugin). See more details in [the PR](https://github.com/sourcegraph/sourcegraph/pull/22580).

# babel-plugin-transform-react-hot-loader-wrapper

[![npm](https://img.shields.io/npm/v/@sourcegraph/babel-plugin-transform-react-hot-loader-wrapper.svg)](https://www.npmjs.com/package/@sourcegraph/babel-plugin-transform-react-hot-loader-wrapper)
[![downloads](https://img.shields.io/npm/dt/@sourcegraph/babel-plugin-transform-react-hot-loader-wrapper.svg)](https://www.npmjs.com/package/@sourcegraph/babel-plugin-transform-react-hot-loader-wrapper)
[![build](https://travis-ci.org/sourcegraph/babel-plugin-transform-react-hot-loader-wrapper.svg?branch=master)](https://travis-ci.org/sourcegraph/babel-plugin-transform-react-hot-loader-wrapper)
[![codecov](https://codecov.io/gh/sourcegraph/babel-plugin-transform-react-hot-loader-wrapper/branch/master/graph/badge.svg?token=FCmA2xRatn)](https://codecov.io/gh/sourcegraph/babel-plugin-transform-react-hot-loader-wrapper)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

Wraps all exported React components (whose names match the configured pattern) with [react-hot-loader](https://github.com/gaearon/react-hot-loader) to enable hot-reloading, even if the React components are spread across Webpack chunks using [code splitting](https://webpack.js.org/guides/code-splitting/).

For example, this source file:

```javascript
import React from 'react'

export const A = () => <p>a</p>
```

becomes:

```javascript
import React from 'react'
import { hot } from 'react-hot-loader/root'

export const A = hot(() => <p>a</p>)
```

## Usage

```
npm install --save-dev @sourcegraph/babel-plugin-transform-react-hot-loader-wrapper
# or
yarn add --dev @sourcegraph/babel-plugin-transform-react-hot-loader-wrapper
```

Then add this to your Babel configuration file (`.babelrc` or `babel.config.js`):

```json
{
  "plugins": [
    [
      "@sourcegraph/babel-plugin-transform-react-hot-loader-wrapper",
      {
        "modulePattern": "src/.*Page\\.tsx$",
        "componentNamePattern": "Page$"
      }
    ]
  ]
}
```

### Configuration

- `modulePattern`: A regular expression that matches files to process. You probably only want to wrap your own application's React page components, not `node_modules` or utility modules. The example above (`src/.*Page\\.tsx$`) matches all files in `src/` ending with `Page.tsx`.
- `componentNamePattern`: A regular expression that matches React component names to process. The example above (`Page$`) matches all React components whose name ends with `Page`. This matches `export const MyPage = () => <p>hello</p>` but does not match `export function myOtherFunction() { return 123 }`.

## Known issues

- `default` exports are not supported (`export default class Foo ...`), only named exports (`export class Foo ...`).

## Build

```
yarn
yarn build
```

## Test

```
yarn test
```

## Release

Releases are done automatically in CI when commits are merged into master by analyzing [Conventional Commit Messages](https://conventionalcommits.org/). After running `yarn`, commit messages will be linted automatically when committing though a git hook.
