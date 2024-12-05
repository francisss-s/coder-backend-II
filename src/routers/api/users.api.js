import CustomRouter from "../../utils/CustomRouter.util.js";
import passportCb from "../../middlewares/passportCb.mid.js";

class UsersApiRouter extends CustomRouter {
  constructor() {
    super();
    this.init();
  }
  init = () => {
    this.create("/register", ["PUBLIC"], passportCb("register"), register);
    this.create("/login", ["PUBLIC"], passportCb("login"), login);
    this.create("/signout", ["USER", "ADMIN"], passportCb("signout"), signout);
    this.create("/current", ["PUBLIC"], passportCb("current"), current);
  };
}

const users = new UsersApiRouter();
export default users.getRouter();

async function register(req, res, next) {
  const { user } = req;
  const token = user.token;

  // Configurar opciones de la cookie
  const opts = {
    maxAge: 60 * 60 * 24  * 7, // 1 día
    httpOnly: true, // Evita acceso desde JavaScript del cliente
    secure: process.env.NODE_ENV === 'production', // Solo en HTTPS si está en producción
    sameSite: 'strict', // Protección contra ataques CSRF
  };

  // Establecer cookie en la respuesta
  res.cookie("token", token, opts);

  return res.status(201).json({
    message: "User registered and logged in successfully!",
    user: {
      id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
    },
  });
}

async function login(req, res, next) {
  const { token } = req.user;
  const opts = { maxAge: 60 * 60 * 24 * 7, httpOnly: true };
  const message = "User logged in!";
  const response = "OK";
  return res.cookie("token", token, opts).json200(response, message);
}
function signout(req, res, next) {
  const message = "User signed out!";
  const response = "OK";
  return res.clearCookie("token").json200(response, message);
}

async function current(req, res, next) {
  // response a si existe o no un token de usuario en las cookies y si esta actva la sesion
  if (req.cookies.token) {
    return res.status(200).json({
      message: req.user,
      online: true,
    });
  }else
    return res.status(200).json({
      message: req.user.email.toUpperCase() + " IS OFFLINE",
      online: false,
    });

}