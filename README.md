# mui-imports-codemod

This is a codemod using [`jscodeshift`](https://github.com/facebook/jscodeshift)
that transforms `@material-ui` import statements from this format

```typescript
import { Button, Link } from '@material-ui/core'
```

into this format

```typescript
import Button from '@material-ui/core/Button'
import Link from '@material-ui/core/Link'
```

This is useful if you have a very slow suite of unit tests that could be sped up
by using more specific imports, as described
[here](https://blog.bitsrc.io/why-is-my-jest-suite-so-slow-2a4859bb9ac0), and
you want to rewrite your imports across a large codebase.

The codemod makes some assumptions related to `@material-ui` but should be
reasonably easy to adapt for other large libraries if you wish.


## Run the mod

See the `mod` command in the `package.json` for an example of how to execute the
mod.


## Run the tests

```bash
npm i
npm run test
```


## Future improvement ideas

- Preserve `*Props` import aliases like `import { ButtonProps as X }` (value
  alises are preserved correctly)

- Group imports from the same module together (though eslint [can do
  this](https://eslint.org/docs/latest/rules/no-duplicate-imports))
