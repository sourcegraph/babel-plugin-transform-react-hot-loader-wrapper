import { types as t } from '@babel/core'
// @ts-ignore
import { addNamed } from '@babel/helper-module-imports'
import { NodePath, Visitor } from '@babel/traverse'
import { Declaration, Expression, Identifier } from '@babel/types'

interface Options {
    componentNamePattern: string | RegExp
    modulePattern: string | RegExp
}

interface State {
    opts: Options

    file: {
        opts: {
            filename: string | null
        }
    }

    /** To avoid adding multiple imports in the same file. */
    hotIdentifier?: Identifier
}

export default ({ types }: { types: typeof t }) => {
    const getHotIdentifier = (path: NodePath, state: State): Identifier => {
        const hotIdentifier: Identifier = state.hotIdentifier || addNamed(path, 'hot', 'react-hot-loader/root')
        state.hotIdentifier = hotIdentifier
        return hotIdentifier
    }

    const getComponentExpr = (node: Declaration): { name: string; expr: Expression } | null => {
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
            return { name: decl.id.name, expr: decl.init }
        }
        if (t.isClassDeclaration(node)) {
            if (!node.id) {
                return null
            }
            const expr: t.ClassExpression = t.clone<any>(node)
            expr.type = 'ClassExpression'
            return {
                name: node.id.name,
                expr,
            }
        }
        if (t.isFunctionDeclaration(node)) {
            if (!node.id) {
                return null
            }
            const expr: t.FunctionExpression = t.clone<any>(node)
            expr.type = 'FunctionExpression'
            return {
                name: node.id.name,
                expr,
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
        const component = getComponentExpr(node)
        if (!component) {
            return null
        }
        if (!componentNamePattern.test(component.name)) {
            return null
        }
        return t.variableDeclaration('const', [
            t.variableDeclarator(
                types.identifier(component.name),
                types.callExpression(getHotIdentifier(path, state), [component.expr])
            ),
        ])
    }

    const visitor: Visitor<State> = {
        Program: (path, state) => {
            let { modulePattern } = state.opts
            if (typeof modulePattern !== 'string' && !(modulePattern instanceof RegExp)) {
                throw new Error(
                    '.modulePattern must be a string or RegExp (to match the paths of modules that should be processed).'
                )
            }
            if (typeof modulePattern === 'string') {
                modulePattern = new RegExp(modulePattern)
            }

            if (state.file.opts.filename === null || !modulePattern.test(state.file.opts.filename)) {
                return
            }

            path.traverse(
                {
                    ExportNamedDeclaration: (path, state) => {
                        let { componentNamePattern } = state.opts
                        if (typeof componentNamePattern !== 'string' && !(componentNamePattern instanceof RegExp)) {
                            throw new Error(
                                ".componentNamePattern must be a string or RegExp (to match the exported names that should be wrapped with react-hot-loader/root's `hot` function)."
                            )
                        }
                        if (typeof componentNamePattern === 'string') {
                            componentNamePattern = new RegExp(componentNamePattern)
                        }

                        if (path.node.declaration) {
                            const d = getWrappedDeclaration(path, path.node.declaration, state, componentNamePattern)
                            if (d) {
                                path.replaceWith(t.exportNamedDeclaration(d, []))
                            }
                        }
                    },
                },
                state
            )
        },
    }

    return {
        name: '@sourcegraph/babel-plugin-transform-react-hot-loader-wrapper',
        visitor,
    }
}
