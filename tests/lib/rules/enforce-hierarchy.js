"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var rule = require("../../../lib/rules/enforce-hierarchy"),
    RuleTester = require("eslint").RuleTester;
const {createTest} = require("../../_utils");

const settings = {
    htg: {
        path: {
            '@modules/': 'src/modules/'
        },
        modules: [
            '@modules/libs',
            '@modules/features',
            '@modules/apps/*/libs',
            '@modules/apps/*/features',
        ]
    }
};

const options = [{
    '@modules/libs': ['@modules/libs'],
    '@modules/features': ['@modules/libs', '@modules/features'],
    '@modules/apps/*/libs': ['@modules/apps/*/libs', '@modules/libs'],
    '@modules/apps/*/features': ['@modules/apps/*/libs', '@modules/apps/*/features', '@modules/libs', '@modules/features'],
}];

const test = createTest(settings);

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

var ruleTester = new RuleTester();
ruleTester.run("enforce-hierarchy", rule, {

    valid: [
        test({ // Import from the same category
            code: "import { fn } from '@modules/libs/myFeature1'",
            filename: "@modules/features/myFeature2/Component.tsx",
            options,
        }),
        test({ // Import from non-module to module
            code: "import { fn } from 'src/custom/folder/file'",
            filename: "@modules/libs/myFeature2/Component.tsx",
            options,
        }),
        test({ // Import from module to non-module
            code: "import { fn } from '@modules/libs/myFeature1'",
            filename: "src/custom/folder/file.ts",
            options,
        }),
        test({ // Import from non-module to non-module
            code: "import { fn } from 'src/another/custom/folder/file'",
            filename: "src/custom/folder/file.ts",
            options,
        })
    ],

    invalid: [
        test({ // Import from forbidden category
            code: "import { fn } from '@modules/features/myPage'",
            filename: "@modules/libs/unitCard/DesktopComponent.tsx",
            options,
            errors: [{
                message: "HTG: Importing from forbidden module category: /src/modules/libs -> /src/modules/features.",
                type: "Literal"
            }]
        }),
        test({ // Import from forbidden wildcard category
            code: "import { fn } from '@modules/features/myPage'",
            filename: "@modules/apps/demo/libs/unitCard/DesktopComponent.tsx",
            options,
            errors: [{
                message: "HTG: Importing from forbidden module category: /src/modules/apps/*/libs -> /src/modules/features.",
                type: "Literal"
            }]
        })
    ]
});
