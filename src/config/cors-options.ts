import logger from './logger';

const corsOptions = (domain: string) => {
  return {
    origin: true,
    methods: 'OPTION, GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
    exposedHeaders: ['Authorization', 'refresh_token']
  };
};

export default corsOptions;
