declare module 'babel-plugin-tester' {
    export interface TesterOption {
        plugin: any
        snapshot?: boolean
        tests: Test[]
    }

    export interface Test {
        title?: string
        code?: string
        output?: string
        snapshot?: boolean
        fixture?: string
        outputFixture?: string
        pluginOptions?: { [name: string]: any }
    }

    export default function pluginTester(option: TesterOption): void
}
