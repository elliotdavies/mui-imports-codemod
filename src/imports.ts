import { API, FileInfo } from 'jscodeshift';

const materialUILibs = [
  '@material-ui/core',
  '@material-ui/icons',
  '@material-ui/lab',
  '@material-ui/pickers'
]

const transformer = (file: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Run the transformation once per library
  materialUILibs.forEach(libName => {
    // Start by finding all the import statements that reference the library
    root.find(j.ImportDeclaration, {
      source: {
        type: 'StringLiteral',
        value: libName
      }
    })
    // Then replace each import statement with a series of more specific ones
    .replaceWith(path => 
      path.node.specifiers.map(specifier => {
        // The `Y` alias in `import { X as Y }`
        const localName = specifier.local.name

        // The `X` in `import { X as Y }`
        // @ts-expect-error The type definitions don't allow for `imported`
        // here, but it does exist
        const originalName: string = specifier.imported.name

        // If we see a statement like
        //
        //    import { ButtonProps } from 'X'
        //
        // we assume that:
        //
        // A) we need to import from `X/Button` rather than `X/ButtonProps`
        // B) we should keep it as a named import rather than a default import
        //
        // In other words we are aiming for output like
        //
        //    import { ButtonProps } from 'X/Button'
        //
        if (originalName.includes('Props')) {
          return j.importDeclaration(
            [
              j.importSpecifier(
                j.identifier(localName)
              ),
            ],
            j.literal(`${libName}/${originalName.replace('Props', '')}`)
          )
        }
        // For all other named imports, we assume that we're transforming a line
        // like
        //
        //    import { Button } from 'X'
        //
        // into a line like
        //
        //    import Button from 'X/Button'
        //
        // i.e. we're turning it into a default import and making the package
        // path more specific
        else {
          return j.importDeclaration(
            [
              j.importDefaultSpecifier(
                j.identifier(localName)
              ),
            ],
            j.literal(`${libName}/${originalName}`)
          )
        }
      })
    )
  })

  return root.toSource();
}

export default transformer
