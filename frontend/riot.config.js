const {
  registerPreprocessor
} = require('@riotjs/compiler');
const ts = require('typescript');

registerPreprocessor('javascript', 'typescript', function(code, {
  options
}) {
  const {
    file
  } = options

  const result = ts.transpileModule(code, {
    fileName: file,
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      strict: true
    }
  })

  return {
    code: result.outputText,
    map: null
  }
});

module.exports = {
  hot: false,
};
