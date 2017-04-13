'use strict';

module.exports = function generateJoiMiddlewareInstance (cfg) {
  cfg = cfg || {}; // default to an empty config

  const Joi = cfg.joi || require('joi');

  // We'll return this instance of the middleware
  const instance = {};

  // These represent the incoming data containers that we might need to validate
  const containers = {
    query: {
      storageProperty: 'originalQuery',
      joi: {
        convert: true,
        allowUnknown: false,
        abortEarly: false
      }
    },
    body: {
      storageProperty: 'originalBody',
      joi: {
        convert: true,
        allowUnknown: false,
        abortEarly: false
      }
    },
    headers: {
      storageProperty: 'originalHeaders',
      joi: {
        convert: true,
        allowUnknown: true,
        stripUnknown: false,
        abortEarly: false
      }
    },
    params: {
      storageProperty: 'originalParams',
      joi: {
        convert: true,
        allowUnknown: false,
        abortEarly: false
      }
    }
  };

  Object.keys(containers).forEach((type) => {
    // e.g the "body" or "query" from above
    const container = containers[type];

    instance[type] = function (schema, opts) {
      opts = opts || {}; // like config, default to empty object

      return function exporessJoiValidator (req, res, next) {
        const ret = Joi.validate(req[type], schema, opts.joi || container.joi);

        if (!ret.error) {
          req[container.storageProperty] = req[type];
          req[type] = ret.value;
          next();
        } else if (opts.passError || cfg.passError) {
          next(ret.error);
        } else {
          res.status(opts.statusCode || cfg.statusCode || 400).end(ret.error.toString());
        }
      };
    };
  });

  return instance;
};
