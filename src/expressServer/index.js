import {config, app} from '/config';

const server = app.listen(config.port, () => {
  console.log(
    `server started on port http://localhost:${config.port} (${config.env})`,
  );
});

export default server;
