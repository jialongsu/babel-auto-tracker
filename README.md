# babel-auto-tracker

 使用注释实现自动埋点的babel插件

## 安装

```sh
npm install babel-auto-tracker or  yarn add babel-auto-tracker -D
```

## 配置

### 在.babelrc文件中

```sh
{
  "presets": [
    ...
  ],
  "plugins": [
    "babel-auto-tracker"
  ]
}
```

### 在webpack中

```sh
{
  module: [
    rules: [
       {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: paths.appSrc,
        loader: require.resolve('babel-loader'),
        options: {
          plugins: [
            // 引入自动埋点插件
            [
              require.resolve('babel-auto-tracker'),
              {
                pathName: path.resolve(__dirname, '../src/utils/tracker'), // 引入埋点方法的文件路径
              }
            ]
          ].filter(Boolean),
        },
      },
    ]
  ],
}
```

## 使用方法

```sh
 /**
  * autoTracker
  *
  * @param {string} id - 订单id
  * @param {string} name - 用户名
  */
  function needTracker(id, name, text) {
    console.log('needTracker====需要埋点1 ', text);
  }

  /**
  * autoTracker
  * 
  * @param {string} id - 订单id
  */
  const needTracker2 = (id) => {
    console.log('needTracker====需要埋点2 ');
  }

  /**
  * autoTracker
  * 
  * @param {string} id - 订单id
  */
  const needTracker3 = function (id) {
    console.log('needTracker====需要埋点3');
  };
```

```sh
 class TestComponent {

  /**
  * autoTracker
  * 
  * @param {string} id - 订单id
  */
  needTracker4(id) {
    console.log('needTracker====需要埋点4');
  }
 }

```

注意点：

1. 第一个注释需要指定为：autoTracker，告诉babel-auto-tracker该函数需要自动埋点。
2. 注释中声明的参数需要和函数中的参数名称以及位置一一对应。
