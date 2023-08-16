import { API, FileInfo, TSTypeReference } from 'jscodeshift';

const transformer = (file: FileInfo, api: API) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let fileWasModified:boolean = false

  /**
   * 1. Arrow functions
   */

  // Find all the (assigned) arrow function expressions
  root.find(j.VariableDeclarator, {
    init: {
      type: 'ArrowFunctionExpression',
      params: [
        {
          type: 'ObjectPattern',
          typeAnnotation: {
            type: 'TSTypeAnnotation',
            typeAnnotation: {
              type: 'TSTypeReference',
              typeName: {
                type: 'Identifier',
              }
            }
          }
        }
      ],
    }
  })

  // Only keep those where the type parameter ends with 'Props'
  .filter(path => {
    // @ts-expect-error
    const propsType = path.node.init.params[0].typeAnnotation.typeAnnotation.typeName.name

    // @ts-expect-error
    const hasTypeParams = !!path.node.init.typeParameters

    return propsType.endsWith('Props') && !hasTypeParams
  })

  // Rewrite to the FC style
  .replaceWith(path => {
    // @ts-expect-error
    const constName = path.node.id.name

    // @ts-expect-error
    const propsType: TSTypeReference = path.node.init.params[0].typeAnnotation.typeAnnotation

    if (path.node.init?.type !== 'ArrowFunctionExpression') {
      return path
    }

    const firstParam = path.node.init.params[0]
    if (firstParam.type !== 'ObjectPattern') {
      return path
    }

    fileWasModified = true

    return j.variableDeclarator(
      j.identifier.from({
        name: constName,
        typeAnnotation: j.tsTypeAnnotation(j.tsTypeReference(
          j.identifier('FC'),
          j.tsTypeParameterInstantiation([ propsType ])
        )),
      }),

      j.arrowFunctionExpression(
        [
          {...firstParam, typeAnnotation: null},
          ...path.node.init.params.slice(1)
        ],

        path.node.init.body,
        path.node.init.expression
      )
    )
  })


  /**
   * 2. 'Function' functions
   */

  // Find all the function expressions
  root.find(j.FunctionDeclaration, {
    params: [
      {
        type: 'ObjectPattern',
        typeAnnotation: {
          type: 'TSTypeAnnotation',
          typeAnnotation: {
            type: 'TSTypeReference',
            typeName: {
              type: 'Identifier',
            }
          }
        }
      }
    ]
  })
  // Only keep those where the type parameter ends with 'Props'
  .filter(path => {
    // @ts-expect-error
    const propsType = path.node.params[0].typeAnnotation.typeAnnotation.typeName.name

    const hasTypeParams = !!path.node.typeParameters

    return propsType.endsWith('Props') && !hasTypeParams
  })

  // Rewrite to an arrow function in the FC style
  .replaceWith(path => {
    // @ts-expect-error
    const propsType = path.node.params[0].typeAnnotation.typeAnnotation

    const funcName = path.node.id?.name
    const firstParam = path.node.params[0]

    if (!funcName || firstParam.type !== 'ObjectPattern') {
      return path
    }

    fileWasModified = true

    return j.variableDeclaration('const', [
      j.variableDeclarator(
        j.identifier.from({
          name: funcName,
          typeAnnotation: j.tsTypeAnnotation(j.tsTypeReference(
            j.identifier('FC'),
            j.tsTypeParameterInstantiation([ propsType ])
          )),
        }),

        j.arrowFunctionExpression(
          [
            {...firstParam, typeAnnotation: null},
            ...path.node.params.slice(1)
          ],

          path.node.body,
          path.node.expression
        )
      )
    ])
  })


  /**
   * 3. Adding the 'FC' import
   */

  if (fileWasModified) {
    let foundReactImport: boolean = false

    // Find all the import statements
    root.find(j.ImportDeclaration, {
      source: {
        type: 'StringLiteral',
        value: 'react'
      }
    })
    // Filter for those that don't include 'FC' already
    .filter(path => !path.node.specifiers?.some(s => s.local?.name === 'FC'))
    // Add the 'FC'
    .replaceWith(path => {
      foundReactImport = true

      return {
        ...path.node,
        specifiers: [
          j.importSpecifier(j.identifier('FC')),
          ...(path.node.specifiers ?? [])
        ]
      }
    })

    if (!foundReactImport) {
      root.find(j.ImportDeclaration)
      .filter((_,i) => i === 0)
      .insertAfter(() => {
        return j.importDeclaration([
          j.importSpecifier(j.identifier('FC'))
        ],
        j.literal('react'))
      })
    }
  }

  return root.toSource();
}

export default transformer
