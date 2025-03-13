const config = {
  development: {
    apiUrl: 'http://localhost:3000/api',
  },
  production: {
    apiUrl: '/api', // Same-origin request in production
  }
};

const environment = import.meta.env.MODE || 'development';
export default config[environment]; 