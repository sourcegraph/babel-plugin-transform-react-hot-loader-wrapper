import pluginTester from 'babel-plugin-tester'
import plugin from '.'

const IMPORTS = `import { hot as _hot } from "react-hot-loader/root";\n`

pluginTester({
    plugin,
    tests: [
        {
            title: 'const arrowfunc',
            code: `export const A = () => 'a'`,
            output: `${IMPORTS}export const A = _hot(() => 'a');`,
            pluginOptions: { modulePattern: '', componentNamePattern: '^A$' },
        },
        {
            title: 'class',
            code: `export class A extends React.Component {}`,
            output: `${IMPORTS}export const A = _hot(class A extends React.Component {});`,
            pluginOptions: { modulePattern: '', componentNamePattern: '^A$' },
        },
        {
            title: 'function',
            code: `export function A(props) { return 'a'; }`,
            output: `${IMPORTS}export const A = _hot(function A(props) {\n  return 'a';\n});`,
            pluginOptions: { modulePattern: '', componentNamePattern: '^A$' },
        },
        {
            title: 'ignored by componentNamePattern',
            code: `export const X = () => 'a'`,
            output: `export const X = () => 'a';`,
            pluginOptions: { modulePattern: '', componentNamePattern: '^A$' },
        },
        {
            title: 'multiple in same file',
            code: `export const A = () => 'a'; export const B = () => 'b'`,
            output: `${IMPORTS}export const A = _hot(() => 'a');\nexport const B = _hot(() => 'b');`,
            pluginOptions: { modulePattern: '', componentNamePattern: '' },
        },
    ],
})
