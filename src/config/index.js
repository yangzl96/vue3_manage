/**
 * 环境配置封装
 */
const env = import.meta.env.MODE || 'production';
const EnvConfig = {
  development: {
    baseApi: '/api',
    mockApi: 'https://www.fastmock.site/mock/c1c302e8baed9894c48c17e4738c092e/api'
  },
  test: {
    baseApi: '//test.futurefe.com/api',
    mockApi: 'https://www.fastmock.site/mock/c1c302e8baed9894c48c17e4738c092e/api'
  },
  production: {
    baseApi: '//futurefe.com/api',
    mockApi: 'https://www.fastmock.site/mock/c1c302e8baed9894c48c17e4738c092e/api'
  }
}
export default {
  env,
  mock: false,
  namespace: 'manager',
  ...EnvConfig[env]
}