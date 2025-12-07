# vue2下使用Monaco Editor

## 1.简介

​		Monaco Editor是为[VS Code提供支持](https://github.com/Microsoft/vscode)的代码编辑器。描述代码编辑器的功能，良好的网页是[在这里](https://code.visualstudio.com/docs/editor/editingevolved)。它已获得MIT许可，并支持Classic Edge，Edge，Chrome，Firefox，Safari和Opera。移动浏览器或移动Web框架**不**支持Monaco编辑器（但移动的有的浏览器是支持的，起码我用的几个都支持）。

## 2.开始

### 2.1 安装环境

```javascript
npm install monaco-editor@0.21.2 --save
npm install monaco-editor-webpack-plugin --save //这个必须安装，不然起不来
```

### 2.2 配置文件

修改webpack.base.conf.js配置文件。(前几步借鉴[时间脱臼](https://www.cnblogs.com/helloluckworld/p/9663308.html)大神博客，步骤大同小异)

```
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
module.exports = {
  ...
  plugins: [
    ...
    new MonacoWebpackPlugin()
  ]
};
```

### 2.3 开始使用

新建vue文件，添加如下代码即可使用

```html
<div id="container"></div> <!--宽高自行设定 -->
```

```javascript
import * as monaco from 'monaco-editor'
export default{
    data(){
        return {
            editor:null,//文本编辑器
        }
    },
    mounted(){
      this.initEditor();  
    },
    methods:{
        initEditor(){
            // 初始化编辑器，确保dom已经渲染
            this.editor = monaco.editor.create(document.getElementById('container'), {
                value：'',//编辑器初始显示文字
                language:'sql',//语言支持自行查阅demo
                automaticLayout: true,//自动布局
                theme:'vs-dark' //官方自带三种主题vs, hc-black, or vs-dark
            });
        },
        getValue(){
            this.editor.getValue(); //获取编辑器中的文本
        }
    }
}
```

附：[Monaco Editor demo](https://microsoft.github.io/monaco-editor/)

![](https://i-blog.csdnimg.cn/blog_migrate/e08bde77f6cf1e69f072b0ebc202de88.png)

附：语言支持（当然支持自定义语言）

```javascript
//modesIds即为支持语言
var modesIds = monaco.languages.getLanguages().map(function(lang) { return lang.id; });
```

附：配置项(根据自身需要在初始化编辑器是配置) [配置项链接](https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.istandaloneeditorconstructionoptions.html)

```javascript
selectOnLineNumbers: true,//显示行号
roundedSelection: false,
readOnly: false,        // 只读
cursorStyle: 'line',        //光标样式
automaticLayout: false, //自动布局
glyphMargin: true,  //字形边缘
useTabStops: false,
fontSize: 28,       //字体大小
autoIndent:true,//自动布局
quickSuggestionsDelay: 500,   //代码提示延时
```

至此，最简单的文档编辑器已经完成。

## 3. 进阶

### 3.1 文件改动状态

```javascript
export default{
    data(){
        return {
            editor:null,//文本编辑器
            isSave:true,//文件改动状态，是否保存
            oldValue:'' //保存后的文本
        }
    },
    methods:{
        initEditor(){
            // 初始化编辑器，确保dom已经渲染
            this.editor = monaco.editor.create(document.getElementById('container'), {
                value：'',//编辑器初始显示文字
                language:'sql',//语言支持自行查阅demo
                automaticLayout: true,//自动布局
                theme:'vs-dark' //官方自带三种主题vs, hc-black, or vs-dark
            });
            this.editor.onKeyUp(() => {
                // 当键盘按下，判断当前编辑器文本与已保存的编辑器文本是否一致
                if(this.editor.getValue() != this.oldValue){
                    this.isSave = false;
                }
            });
        },
        //保存编辑器方法
        saveEditor(){
            this.oldValue = this.editor.getValue();
            ...保存逻辑
        }
    }
}
```

### 3.2 更改编辑器语言

```javascript
export default{
    data(){
        return {
            editor:null,//文本编辑器
        }
    },
    methods:{
        initEditor(){
            // 初始化编辑器，确保dom已经渲染
            this.editor = monaco.editor.create(document.getElementById('container'), {
                value：'',//编辑器初始显示文字
                language:'sql',//语言支持自行查阅demo
                automaticLayout: true,//自动布局
                theme:'vs-dark' //官方自带三种主题vs, hc-black, or vs-dark
            });
        },
        changeModel(){
            var oldModel = this.editor.getModel();//获取旧模型
            var value = this.editor.getValue();//获取旧的文本
            //创建新模型，value为旧文本，id为modeId，即语言（language.id）
            //modesIds即为支持语言
			//var modesIds = monaco.languages.getLanguages().map(function(lang) { return lang.id; });
            var newModel = monaco.editor.createModel(value,id);
            //将旧模型销毁
            if(oldModel){
                oldModel.dispose();
            }
            //设置新模型
            this.editor.setModel(newModel);
        }
    }
}
```

### 3.3 更改编辑器配置

```javascript
//此例为更改编辑器为只读模式,其余以此类推
this.editor.updateOptions({readOnly:true})
```

### 3.4 触发编辑器事件

```javascript
//此为格式化代码,anything无用，后一个参数为action事件，自行查找，我也就找到这么一个
this.editor.trigger('anything','editor.action.formatDocument');
```

### 3.5 获取选中内容
```javascript
//简单方法，后面的就别用了。。。
this.editor.getModel().getValueInRange(this.editor.getSelection())
```
```javascript
//获取编辑器选中的参数，包括起始行等等
var selection = this.editor.getSelection();
//获取当前选中的文本
var text = currentFn(editor,selection.startLineNumber,selection.startColumn,selection.endLineNumber,selection.endColumn);
```

```javascript
function currentFn(monacoEditor, startLineNumber, startColumn, endLineNumber, endColumn) {
    let currentText = '' //选中文字的内容
    let num = 0;//累计回车的数量
    let startIndex = null;//截取编辑器内容的起始下标
    let endIndex = null;//截取编辑器内容的结束下标
    // monacoEditor.getValue().split('')  :  获取编辑器内容，并拆成数组，并把每一个字符作为数组的每一项
    if (startLineNumber < endLineNumber) {//当起始行<结束行（方向：从上到下，从左到右）
        monacoEditor.getValue().split('').map((item, index) => {
            if (startLineNumber === 1) {//判断起始行当前行数，为1 则前面没有回车
            startIndex = startColumn - 1;//获取起始下标
            if (item === '\n') {
                num += 1;//累计回车数量（针对于结束行）
                if (num === endLineNumber - 1) {//获取结束行最近的回车的下标+结束行的结束列
                endIndex = index + endColumn
                }
            }
            } else {//判断起始行当前行数，大于1 则前面有回车
            if (item === '\n') {//累计回车数量
                num += 1
                if (num === startLineNumber - 1) {//获取起始行最近的回车的下标+起始行的起始列
                startIndex = index + startColumn
                }
                if (num === endLineNumber - 1) {//获取结束行最近的回车的下标+结束行的结束列
                endIndex = index + endColumn
                }
            }
            }
        })
    } else if (startLineNumber > endLineNumber) {//当起始行>结束行（方向：从下到上，从右到左）
        monacoEditor.getValue().split('').map((item, index) => {
            if (endLineNumber === 1) {//判断结束行当前行数，为1 则前面没有回车
            startIndex = endColumn - 1;//获取起始下标
            if (item === '\n') {
                num += 1;//累计回车数量（针对于起始行）
                if (num === startLineNumber - 1) {//获取结束下标：起始行最近的回车的下标+起始行的起始列
                endIndex = index + startColumn
                }
            }
            } else {//判断结束行当前行数，大于1 则前面有回车
            if (item === '\n') {//累计回车数量
                num += 1
                if (num === endLineNumber - 1) {//获取结束行最近的回车的下标+结束行的结束列
                startIndex = index + endColumn
                }
                if (num === startLineNumber - 1) {//获取起始行最近的回车的下标+起始行的起始列
                endIndex = index + startColumn
                }
            }
            }
        })
    } else if (startLineNumber === endLineNumber) {//当起始行=结束行（方向：从左到右，从右到左）
        monacoEditor.getValue().split('').map((item, index) => {
            if (endLineNumber === 1) {
            startIndex = startColumn < endColumn ? startColumn - 1 : endColumn - 1
            endIndex = startColumn > endColumn ? startColumn - 1 : endColumn - 1
            } else {
            if (item === '\n') {
                num += 1
                if (num === endLineNumber - 1) {
                startIndex = startColumn < endColumn ? startColumn + index : endColumn + index
                endIndex = startColumn > endColumn ? startColumn + index : endColumn + index
                }
            }
            }
        })
    }
    currentText = monacoEditor.getValue().slice(startIndex, endIndex)
    return currentText
}
```

### 3.6 代码提示

```javascript
monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: function(model, position) {
        // 获取当前行数
        const line = position.lineNumber;

        // 获取当前列数
        const column = position.column;
        // 获取当前输入行的所有内容
        const content = model.getLineContent(line)
        // 通过下标来获取当前光标后一个内容，即为刚输入的内容
        const sym = content[column - 2];
        var textUntilPosition = model.getValueInRange({startLineNumber: 1, startColumn: 1, endLineNumber: position.lineNumber, endColumn: position.column});
        var word = model.getWordUntilPosition(position);
        var range = {
            startLineNumber: position.lineNumber,
            endLineNumber: position.lineNumber,
            startColumn: word.startColumn,
            endColumn: word.endColumn
        };
        //---------------------------------------------------
        //上面的代码仅仅是为了获取sym，即提示符
        //---------------------------------------------------
        var suggestions = [];
        if(sym == "$"){
            //...
            //拦截到用户输入$，开始设置提示内容，同else中代码一致，自行拓展
        }else{
            //直接提示，以下为sql语句关键词提示
            var sqlStr = ['SELECT','FROM','WHERE','AND','OR','LIMIT','ORDER BY','GROUP BY'];
            for(var i in sqlStr){
                suggestions.push({
                    label: sqlStr[i], // 显示的提示内容
                    kind: monaco.languages.CompletionItemKind['Function'], // 用来显示提示内容后的不同的图标
                    insertText: sqlStr[i], // 选择后粘贴到编辑器中的文字
                    detail: '', // 提示内容后的说明
                    range:range
                });
            }
        }
        return {
            suggestions: suggestions
        };
    },
    triggerCharacters: ["$",""]
});
```

