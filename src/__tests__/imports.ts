jest.autoMockOff();

const defineTest = require('jscodeshift/dist/testUtils').defineTest;
const applyTransform = require('jscodeshift/dist/testUtils').applyTransform;

defineTest(__dirname, 'imports', null, 'imports', { parser: 'tsx' });
defineTest(__dirname, 'fc', null, 'fc', { parser: 'tsx' });
