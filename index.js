const generator = require('@babel/generator');
const {codeFrameColumns} = require('@babel/code-frame');
const importModule = require('@babel/helper-module-imports');

const AUTOTRACKER = 'autoTracker';

// 获取注释中的参数
function parseComment(commentParamAry) {
   // 获取注释中的参数
   const paramAry = commentParamAry.map((param) => {
     const type = param.replace(/.*{(.*)}.*/, "$1"); // 获取参数类型
     const fieldStr = param.split('}')[1]; // 获取字段信息
     let name = fieldStr;
     let description = '';

     // 判断参数是否有描述
     if(fieldStr.indexOf("-") >= 0) {
       const fielAry = fieldStr.split('-');
       name = fielAry[0];
       description = fielAry[1];
     }

     return {
       type,
       name,
       description,
     };
   });

   return paramAry;
}

// 判断函数中是否声明了注释中的参数
function verifyFuncParams(path, paramAry) {
  const params = path.get("params"); // 获取ast中函数节点的参数集合
  let errorResult = '';

  const isError = paramAry.some((param, index) => {
    const paramNode = params[index] || params[index - 1];
    if(param.name !== paramNode.node.name) {
      const commentLoc = path.get('leadingComments')[0].node.loc;
      const commentEndLine = commentLoc.end.line - commentLoc.start.line + 1; // 计算出注释最后一行的行数
      const codeStartLine = commentEndLine + 1; // 根据注释最后一行的行数计算出函数第一行的行数
      const {code} = generator.default(path.node); // 根据当前函数的ast生成代码
      const loc = paramNode.node.loc;
      const location = {
        start: { line: codeStartLine, column: loc.start.column },
        end: { line: codeStartLine, column: loc.end.column },
      };
      // 生成错误提示
      errorResult = codeFrameColumns(
        code, 
        location,
        {
          highlightCode: true, 
          message: `变量：${param.name} 未在函数中声明`
        },
      );
      return true;
    }
    return false;
  });

  if(isError && errorResult) {
    throw new Error(errorResult);
  }

  return isError;
}

// 引用埋点函数
function trackerImportDeclaration(path, state) {
  const pathName = state.opts.pathName; // 获取埋点函数的文件路径
  const trackerImportName  = importModule.addDefault(path, pathName, {
    nameHint: path.scope.generateUid('tracker')
  }).name; 

  return trackerImportName;
}

function setAutoTracker(path, state, template, comentNode) {
  // 只有块级类型的注释才去校验是否需要自动埋点
  if (comentNode.type === "CommentBlock") {
    // 提取注释
    const comentStr = comentNode.value.replace(/\s+/g, ""); // 去除空格
    const comentStrAry = comentStr.split('*').filter((item) => item); // 提取内容并去除空值
    const name = comentStrAry[0]; // 获取注释标题

    // 判断注释标题为AUTOTRACKER-自动埋点标识
    if(name === AUTOTRACKER) {
      // 获取注释中的参数
      const commentParamAry = comentStrAry.slice(1); // 获取参数集合
      const paramAry = parseComment(commentParamAry);

      // 判断函数中是否声明了注释中的参数
      const isError = verifyFuncParams(path, paramAry);

      // 注释中的参数未在函数中声明则跳过
      if(isError) return path.skip();

      // 引入埋点函数
      const trackerImportName  = trackerImportDeclaration(path, state); 

      // 函数插装：将埋点函数插入
      const callParamsStr = paramAry.map((param => param.name)).join(', ');
      path.get("body").node.body.unshift(template(`${trackerImportName}({${callParamsStr}})`)());
    }
  }
}

function autoTracker({types: t, template}) {
  // 思路：
  // 1.根据注释标题判断是否是需要自动埋点的函数，函数类型：函数声明，箭头函数，函数表达式，类方法
  // 2.从注释中提取出埋点参数
  // 3.引入埋点函数文件
  // 4.函数插装：将埋点方法插入需要埋点的函数，并传入参数
  return {
    visitor: {
      'FunctionDeclaration|ArrowFunctionExpression|FunctionExpression|ClassMethod'(path, state) {
        const coment = path.get("leadingComments")[0] || {};
        const comentNode = coment.node;

        if(!comentNode) {
          path.findParent((parentPath) => {
            const coment = parentPath.node.leadingComments;
            if(!coment) {
            	return false;
            }else {
              const comentNode = coment[0] || {};
              setAutoTracker(path, state, template, comentNode);
            	return true;
            }
          });
        }else {
        	setAutoTracker(path, state, template, comentNode);
        }
      },
    }
  };
}

module.exports = autoTracker;