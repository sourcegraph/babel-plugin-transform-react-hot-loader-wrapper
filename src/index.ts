import { types as t, PluginObj, PluginPass } from '@babel/core'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { addNamed } from '@babel/helper-module-imports'
import { declare } from '@babel/helper-plugin-utils'

import type { NodePath, Visitor } from '@babel/traverse'
import type { Declaration, Expression, Identifier } from '@babel/types'

interface Options {
    componentNamePattern?: string | RegExp
    modulePattern?: string | RegExp
}

interface State extends PluginPass {
    /** To avoid adding multiple imports in the same file. */
    hotIdentifier?: Identifier
}

const plugin = declare<Options, PluginObj<State>>(({ assertVersion, types }) => {
    assertVersion(7)

    const getHotIdentifier = (types: typeof t, path: NodePath, state: State): Identifier => {
        if (!state.hotIdentifier) {
            state.hotIdentifier = addNamed(path, 'hot', 'react-hot-loader/root')
        }
        return types.cloneNode(state.hotIdentifier!, true)
    }

    const getComponentExpression = (node: Declaration): { name: string; expr: Expression } | null => {
        if (t.isVariableDeclaration(node)) {
            if (node.declarations.length !== 1) {
                return null
            }
            const decl = node.declarations[0]
            if (!types.isIdentifier(decl.id)) {
                return null
            }
            if (!t.isArrowFunctionExpression(decl.init)) {
                return null
            }
            return { name: decl.id.name, expr: t.cloneNode(decl.init) }
        }
        if (t.isClassDeclaration(node)) {
            if (!node.id) {
                return null
            }
            const expression = t.classExpression(node.id, node.superClass, node.body, node.decorators)
            return {
                name: node.id.name,
                expr: expression,
            }
        }
        if (t.isFunctionDeclaration(node)) {
            if (!node.id) {
                return null
            }
            const expression = t.functionExpression(node.id, node.params, node.body, node.generator, node.async)
            return {
                name: node.id.name,
                expr: expression,
            }
        }
        return null
    }

    const getWrappedDeclaration = (
        path: NodePath,
        node: Declaration,
        state: State,
        componentNamePattern: RegExp
    ): Declaration | null => {
        const component = getComponentExpression(node)
        if (!component) {
            return null
        }
        if (!componentNamePattern.test(component.name)) {
            return null
        }
        const hotIdentifier = getHotIdentifier(t, path, state)
        return t.variableDeclaration('const', [
            t.variableDeclarator(
                types.identifier(component.name),
                types.callExpression(hotIdentifier, [component.expr])
            ),
        ])
    }

    const visitor: Visitor<State> = {
        Program: (path, state) => {
            let { modulePattern } = state.opts as Options
            if (typeof modulePattern !== 'string' && !(modulePattern instanceof RegExp)) {
                throw new TypeError(
                    '.modulePattern must be a string or RegExp (to match the paths of modules that should be processed).'
                )
            }
            if (typeof modulePattern === 'string') {
                modulePattern = new RegExp(modulePattern)
            }

            // Test if file is covered by modulePattern.
            if (
                state.file.opts.filename === null ||
                state.file.opts.filename === undefined ||
                !modulePattern.test(state.file.opts.filename)
            ) {
                return
            }

            const body = path.get('body')

            const exportNamedDeclarations = body.filter((node): node is NodePath<t.ExportNamedDeclaration> =>
                t.isExportNamedDeclaration(node)
            )
            for (const path of exportNamedDeclarations) {
                if (!path.node.declaration) {
                    return
                }

                let { componentNamePattern } = state.opts as Options
                if (typeof componentNamePattern !== 'string' && !(componentNamePattern instanceof RegExp)) {
                    throw new TypeError(
                        ".componentNamePattern must be a string or RegExp (to match the exported names that should be wrapped with react-hot-loader/root's `hot` function)."
                    )
                }
                if (typeof componentNamePattern === 'string') {
                    componentNamePattern = new RegExp(componentNamePattern)
                }

                const declaration = getWrappedDeclaration(path, path.node.declaration, state, componentNamePattern)
                if (declaration) {
                    path.replaceWith(t.exportNamedDeclaration(declaration))
                }
            }
        },
    }

    return {
        name: '@sourcegraph/babel-plugin-transform-react-hot-loader-wrapper',
        visitor,
    }
})

// babel expects plugins to have a default export.
// eslint-disable-next-line import/no-default-export
export default plugin
