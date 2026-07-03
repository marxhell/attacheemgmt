module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'kisii_county_water_energy_env_attachee_secret_key_2024',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  jwtCookieExpire: process.env.JWT_COOKIE_EXPIRE || 30,
};