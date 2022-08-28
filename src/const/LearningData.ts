import { NetworkData } from '../components/TextNetworkGraph'

const learningData = {
  name: 'Hello world',
  children: [

    {
      name: '软件世界',
      children: [
        {
          name: '后端开发',
          children: [
            {
              name: '数据库',
              children: [
                {
                  name: '关系型数据库',
                  children: [
                    {
                      name: 'Oracle'
                    },
                    {
                      name: 'MySQL'
                    },
                    {
                      name: 'SQLite'
                    },
                  ]
                },
                {
                  name: '内存数据库',
                  children: [
                    {
                      name: 'Redis'
                    }
                  ]
                },
                {
                  name: 'NoSQL',
                  children: [
                    {
                      name: 'MongoDB'
                    }
                  ]
                }
              ]
            },
            {
              name: '框架',
              children: [
                {
                  name: 'Express'
                },
                {
                  name: 'Spring MVC'
                },
                {
                  name: 'Spring Boot'
                },
                {
                  name: 'Laravel'
                },
              ]
            },
            {
              name: '语言',
              children: [
                {
                  name: 'Java'
                },
                {
                  name: 'NodeJS'
                },
                {
                  name: 'PHP'
                },
                {
                  name: 'Go'
                },
              ]
            },
            {
              name: '服务器',
              children: [
                {
                  name: 'Linux',
                  children: [
                    {
                      name: 'OS',
                      children: [
                        {
                          name: 'CentOS'
                        },
                        {
                          name: 'Ubuntu Server'
                        },
                      ]
                    },
                    {
                      name: 'Shell'
                    },
                  ]
                },
                {
                  name: 'Windows Server'
                },
                {
                  name: 'Docker'
                },
                {
                  name: '服务器运维'
                },
              ]
            },
          ]
        },
        {
          name: '前端开发',
          children: [
            {
              name: '基础',
              children: [
                {
                  name: 'HTML'
                },
                {
                  name: 'CSS'
                },
                {
                  name: 'JS'
                },
                 {
                  name: 'TypeScript'
                },
                {
                  name: 'SCSS/SASS'
                },
                {
                  name: 'LESS'
                },
              ]
            },
            {
              name: '框架',
              children: [
                {
                  name: 'Vue',
                },
                {
                  name: 'React',
                },
                {
                  name: 'Bootstrap',
                },
                {
                  name: 'Ant Desgin',
                },
              ]
            },
            {
              name: '工具',
              children: [
                {
                  name: 'Webpack'
                },
                {
                  name: 'Babel'
                },
                {
                  name: 'jQuery'
                },
                {
                  name: 'NodeJS'
                },
                {
                  name: 'Electron'
                },
              ]
            },
            {
              name: '网站',
              children: [
                {
                  name: '服务器软件',
                  children: [
                    {
                      name: 'Nginx'
                    },
                    {
                      name: 'Apache'
                    },
                    {
                      name: '容器',
                      children: [
                        {
                          name: 'Docker'
                        },
                        {
                          name: 'K8S'
                        },
                      ]
                    },
                  ]
                },
                {
                  name: '博客软件',
                  children: [
                    {
                      name: 'Halo'
                    },
                    {
                      name: 'WordPress'
                    }
                  ]
                },
              ]
            },
          ]
        },
        
        {
          name: 'APP开发',
          children: [
            {
              name: '跨平台',
              children: [
                {
                  name: 'Flutter'
                },
                {
                  name: 'React Native'
                },
                {
                  name: 'Uniapp',
                },
              ]
            },
            {
              name: 'Android',
              children: [
                {
                  name: 'Java'
                },
                {
                  name: 'Kotlin'
                },
              ]
            },
            {
              name: 'IOS',
              children: [
                {
                  name: 'OC'
                },
                {
                  name: 'Swift'
                },
              ]
            },
          ]
        },
        {
          name: '游戏',
          children: [
            {
              name: 'Unity',
              children: [
                {
                  name: 'C#'
                }
              ]
            },
            {
              name: 'UnrealEngine',
              children: [
                {
                  name: 'C++'
                },
                {
                  name: '蓝图'
                },
              ]
            },
            {
              name: 'Cocos',
            },
            {
              name: '3D建模',
              children: [
                {
                  name: 'Blender',
                },
                {
                  name: '3DSMax',
                },
              ]
            },
          ]
        }
      ]
    },

    {
      name: '计算机世界',
      children: [
        {
          name: '计算机原理',
          children: [
            {
              name: '数据结构和算法',
            },
            {
              name: '编译原理',
            },
            {
              name: '单片机原理',
            },
            {
              name: '网络原理',
            },
            {
              name: '计算机图形学',
            },
          ]
        },
        {
          name: '硬件',
          children: [
            {
              name: '垃圾佬捡垃圾',
            },
            {
              name: '处理器/主板/硬盘50包邮',
            },
            {
              name: '单片机',
              children: [
                {
                  name: '51单片机',
                  children: []
                },
                {
                  name: 'STM32单片机',
                  children: []
                },
              ]
            },
          ]
        },
      ]
    },
    
  ]
} as NetworkData;

export function getLearningData() : NetworkData {
  return learningData
}
